from flask import Blueprint, render_template, request, jsonify
from ai.analyzer import analyze_ingredients, ask_assistant

main = Blueprint("main", __name__)


@main.route("/", methods=["GET", "POST"])
def index():
    result = None
    if request.method == "POST":
        recipe_text = request.form.get("recipe")
        if recipe_text:
            result = analyze_ingredients(recipe_text)
    return render_template("index.html", result=result)


@main.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No question provided"}), 400
    try:
        answer = ask_assistant(question)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
