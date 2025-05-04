# train_model.py

import pandas as pd
import numpy as np
import scipy
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import pickle

# Step 1: Load dataset
df = pd.read_csv('expenses_dataset.csv')  # Replace with the actual path if different

# Step 2: Data cleaning
df = df.dropna(subset=['title', 'amount', 'type', 'category'])
df = df[df['title'].str.strip().astype(bool)]
df['title'] = df['title'].str.lower().str.strip()
df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
df['type'] = df['type'].fillna('EXPENSE').str.upper()
df['category'] = df['category'].str.title()

# Step 3: Train-test split
train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

# Step 4: Feature engineering (TF-IDF + amount)
tfidf = TfidfVectorizer(max_features=1000, stop_words='english')
X_train_text = tfidf.fit_transform(train_df['title'])

# Combine TF-IDF and amount
X_train = scipy.sparse.hstack([
    X_train_text,
    train_df['amount'].values.reshape(-1, 1)
])

# Step 5: Train the model
model = RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42)
model.fit(X_train, train_df['category'])

# Step 6: Save model and vectorizer
with open('model.pkl', 'wb') as model_file:
    pickle.dump(model, model_file)

with open('tfidf.pkl', 'wb') as tfidf_file:
    pickle.dump(tfidf, tfidf_file)

print("✅ Model and vectorizer saved successfully!")
