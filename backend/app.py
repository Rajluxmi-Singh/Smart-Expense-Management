from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import scipy

app = Flask(__name__)
CORS(app)

# Load model and vectorizer
with open('model.pkl', 'rb') as model_file:
    model = pickle.load(model_file)

with open('tfidf.pkl', 'rb') as tfidf_file:
    tfidf = pickle.load(tfidf_file)

@app.route("/api/expenses/predict", methods=["POST"])
def predict():
    data = request.get_json()
    title = data.get("title", "").lower().strip()

    if not title:
        return jsonify({"error": "Title is required"}), 400

    # TF-IDF vector for title
    title_vector = tfidf.transform([title])

    # For prediction, we assume amount = 0 (since frontend sends only title)
    amount_array = np.array([[0]])  # Shape (1,1)

    # Combine TF-IDF + amount
    X_input = scipy.sparse.hstack([title_vector, amount_array])

    # Predict category
    predicted_category = model.predict(X_input)[0]

    return jsonify({"category": predicted_category})

if __name__ == "__main__":
    app.run(port=5001)
