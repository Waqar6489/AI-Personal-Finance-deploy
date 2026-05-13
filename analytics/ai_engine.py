"""
AI Analytics Engine
Uses: Pandas, NumPy, Scikit-learn (Linear Regression, K-Means, Isolation Forest)
As specified in the SRS document - Section 4.2.4
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import datetime
import warnings
warnings.filterwarnings('ignore')

CATEGORIES = ['Food', 'Transport', 'Utilities', 'Healthcare', 'Entertainment', 'Education', 'Other']

def run_full_analysis(income_qs, expense_qs):
    """
    5-Stage AI Analytics Pipeline (SRS 4.2.4):
    Stage 1: Data Extraction & Preprocessing
    Stage 2: Spending Pattern Analysis (K-Means)
    Stage 3: Anomaly Detection (Isolation Forest + Z-score)
    Stage 4: Predictive Forecasting (Linear Regression)
    Stage 5: Insight & Recommendation Generation
    """
    result = {
        'insights': [],
        'predictions': {},
        'anomalies': [],
        'patterns': {},
        'summary': {}
    }

    # Convert to DataFrames
    expenses_data = list(expense_qs.values('id', 'amount', 'category', 'date', 'description'))
    income_data = list(income_qs.values('id', 'amount', 'source', 'date'))

    if not expenses_data and not income_data:
        result['insights'].append({
            'type': 'info', 'icon': '📭',
            'title': 'No Data Available',
            'description': 'Add income and expense records to unlock AI analysis. The ML models need at least 1 month of data.',
            'priority': 1
        })
        return result

    exp_df = pd.DataFrame(expenses_data) if expenses_data else pd.DataFrame(columns=['id','amount','category','date','description'])
    inc_df = pd.DataFrame(income_data) if income_data else pd.DataFrame(columns=['id','amount','source','date'])

    if not exp_df.empty:
        exp_df['amount'] = exp_df['amount'].astype(float)
        exp_df['date'] = pd.to_datetime(exp_df['date'])
        exp_df['month'] = exp_df['date'].dt.to_period('M')
        exp_df['month_num'] = exp_df['date'].dt.month
        exp_df['year'] = exp_df['date'].dt.year

    if not inc_df.empty:
        inc_df['amount'] = inc_df['amount'].astype(float)
        inc_df['date'] = pd.to_datetime(inc_df['date'])

    total_income = float(inc_df['amount'].sum()) if not inc_df.empty else 0
    total_expenses = float(exp_df['amount'].sum()) if not exp_df.empty else 0
    net_savings = total_income - total_expenses

    result['summary'] = {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net_savings': net_savings,
        'savings_rate': round((net_savings / total_income * 100), 1) if total_income > 0 else 0,
        'transaction_count': len(expenses_data) + len(income_data)
    }

    # ---- STAGE 2: Spending Pattern Analysis ----
    if not exp_df.empty:
        cat_totals = exp_df.groupby('category')['amount'].agg(['sum','mean','count']).reset_index()
        cat_totals.columns = ['category','total','avg','count']
        patterns = {}
        for _, row in cat_totals.iterrows():
            patterns[row['category']] = {
                'total': float(row['total']),
                'average': float(row['avg']),
                'count': int(row['count']),
                'percentage': round(float(row['total']) / total_expenses * 100, 1) if total_expenses > 0 else 0
            }
        result['patterns'] = patterns

        # K-Means clustering on spending behavior
        if len(exp_df) >= 3:
            try:
                features = exp_df[['amount']].values
                scaler = StandardScaler()
                features_scaled = scaler.fit_transform(features)
                n_clusters = min(3, len(exp_df))
                kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                exp_df['cluster'] = kmeans.fit_predict(features_scaled)
                cluster_means = exp_df.groupby('cluster')['amount'].mean()
                high_cluster = cluster_means.idxmax()
                high_spend_txns = exp_df[exp_df['cluster'] == high_cluster]
                top_cat_in_high = high_spend_txns.groupby('category')['amount'].sum().idxmax() if not high_spend_txns.empty else None
                if top_cat_in_high:
                    result['insights'].append({
                        'type': 'pattern', 'icon': '📊',
                        'title': f'High-Spend Pattern: {top_cat_in_high}',
                        'description': f'K-Means clustering identified {top_cat_in_high} as your highest-spending cluster category with an average transaction of Rs. {float(high_spend_txns["amount"].mean()):,.0f}. Consider reviewing these expenses.',
                        'priority': 2
                    })
            except Exception:
                pass

        # Top spending category insight
        if patterns:
            top_cat = max(patterns.items(), key=lambda x: x[1]['total'])
            result['insights'].append({
                'type': 'spending', 'icon': '💸',
                'title': f'Top Spending: {top_cat[0]} ({top_cat[1]["percentage"]}%)',
                'description': f'Your highest expense category is {top_cat[0]} at Rs. {top_cat[1]["total"]:,.0f}, representing {top_cat[1]["percentage"]}% of total spending. Based on your pattern, consider setting a budget limit of Rs. {top_cat[1]["total"] * 0.9:,.0f} to save 10%.',
                'priority': 1
            })

    # ---- STAGE 3: Anomaly Detection ----
    if not exp_df.empty and len(exp_df) >= 5:
        try:
            features = exp_df[['amount']].values
            iso_forest = IsolationForest(contamination=0.1, random_state=42)
            exp_df['anomaly'] = iso_forest.fit_predict(features)
            anomalies = exp_df[exp_df['anomaly'] == -1]
            
            # Also z-score based
            mean_amt = exp_df['amount'].mean()
            std_amt = exp_df['amount'].std()
            exp_df['zscore'] = (exp_df['amount'] - mean_amt) / std_amt if std_amt > 0 else 0
            zscore_anomalies = exp_df[exp_df['zscore'].abs() > 2.5]
            
            all_anomaly_ids = set(anomalies.index.tolist() + zscore_anomalies.index.tolist())
            anomaly_records = []
            for idx in all_anomaly_ids:
                if idx < len(exp_df):
                    row = exp_df.iloc[idx]
                    anomaly_records.append({
                        'id': int(row['id']),
                        'amount': float(row['amount']),
                        'category': row['category'],
                        'date': str(row['date'].date()),
                        'description': row.get('description', ''),
                        'zscore': float(row.get('zscore', 0))
                    })
            result['anomalies'] = anomaly_records[:5]
            if anomaly_records:
                result['insights'].append({
                    'type': 'anomaly', 'icon': '🚨',
                    'title': f'{len(anomaly_records)} Unusual Transaction(s) Detected',
                    'description': 'Isolation Forest + Z-score detected {} anomalous transaction(s) significantly above your average spending of Rs. {:,.0f}. Review: {}.'.format(len(anomaly_records), mean_amt, ', '.join(['Rs.{:,.0f} ({})'.format(a['amount'], a['category']) for a in anomaly_records[:2]])),
                    'priority': 1
                })
        except Exception:
            pass

    # ---- STAGE 4: Predictive Forecasting (Linear Regression) ----
    predictions = {}
    if not exp_df.empty:
        try:
            monthly_exp = exp_df.groupby('month')['amount'].sum().reset_index()
            monthly_exp['month_idx'] = range(len(monthly_exp))

            if len(monthly_exp) >= 2:
                X = monthly_exp[['month_idx']].values
                y = monthly_exp['amount'].values
                lr = LinearRegression()
                lr.fit(X, y)
                next_month_idx = len(monthly_exp)
                predicted_total = max(0, float(lr.predict([[next_month_idx]])[0]))
                predictions['next_month_total'] = round(predicted_total, 2)

                # Per-category prediction
                for cat in CATEGORIES:
                    cat_df = exp_df[exp_df['category'] == cat]
                    if not cat_df.empty:
                        cat_monthly = cat_df.groupby('month')['amount'].sum().reset_index()
                        cat_monthly['idx'] = range(len(cat_monthly))
                        if len(cat_monthly) >= 2:
                            lr_cat = LinearRegression()
                            lr_cat.fit(cat_monthly[['idx']].values, cat_monthly['amount'].values)
                            pred_cat = max(0, float(lr_cat.predict([[len(cat_monthly)]])[0]))
                        else:
                            pred_cat = float(cat_monthly['amount'].mean())
                        predictions[cat] = round(pred_cat, 2)
                    else:
                        predictions[cat] = 0

                # Savings prediction
                if total_income > 0:
                    predicted_savings = total_income - predicted_total
                    predictions['predicted_savings'] = round(predicted_savings, 2)
                    result['insights'].append({
                        'type': 'prediction', 'icon': '🔮',
                        'title': f'Next Month Forecast: Rs. {predicted_total:,.0f}',
                        'description': f'Linear Regression model predicts your expenses next month will be approximately Rs. {predicted_total:,.0f}. '
                                       + (f'Expected savings: Rs. {predicted_savings:,.0f}.' if predicted_savings > 0 else f'Warning: Predicted deficit of Rs. {abs(predicted_savings):,.0f}.'),
                        'priority': 2
                    })
        except Exception as e:
            predictions['error'] = str(e)
    result['predictions'] = predictions

    # ---- STAGE 5: Recommendations ----
    if total_income > 0:
        savings_rate = (net_savings / total_income) * 100
        if savings_rate >= 20:
            result['insights'].append({
                'type': 'success', 'icon': '✅',
                'title': f'Excellent Savings Rate: {savings_rate:.1f}%',
                'description': f'You are saving {savings_rate:.1f}% of your income (Rs. {net_savings:,.0f}). Financial experts recommend 20%+ — you are exceeding the target! Keep maintaining this discipline.',
                'priority': 3
            })
        elif savings_rate >= 10:
            result['insights'].append({
                'type': 'warning', 'icon': '⚠️',
                'title': f'Savings Rate: {savings_rate:.1f}% (Target: 20%)',
                'description': f'You are currently saving {savings_rate:.1f}% of income. To reach the recommended 20% target, try to reduce monthly spending by Rs. {(total_income * 0.2 - net_savings):,.0f}.',
                'priority': 2
            })
        else:
            result['insights'].append({
                'type': 'alert', 'icon': '🔴',
                'title': f'Low Savings Rate: {savings_rate:.1f}%',
                'description': f'Your savings rate is only {savings_rate:.1f}%. You need to save an additional Rs. {(total_income * 0.2 - net_savings):,.0f} to reach the 20% benchmark. Review your top expense categories immediately.',
                'priority': 1
            })

    # Budget recommendation
    result['insights'].append({
        'type': 'tip', 'icon': '💡',
        'title': 'AI Recommendation: Set Category Budgets',
        'description': 'Set monthly budget limits for each expense category to enable real-time overspending alerts at 80% and 100% utilization. This prevents reactive financial behavior.',
        'priority': 3
    })

    result['insights'].sort(key=lambda x: x.get('priority', 3))
    return result
