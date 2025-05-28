from flask import Blueprint, render_template, request, jsonify
from ai.analyzer import analyze_ingredients, ask_assistant
import fitz  # PyMuPDF

main = Blueprint("main", __name__)

@main.route("/", methods=["GET", "POST"])
def index():
    result = None
    recipe_text = None

    if request.method == "POST":
        if "recipe" in request.form and request.form.get("recipe").strip():
            # User pasted or spoke text
            recipe_text = request.form.get("recipe", "")
        elif "recipe_file" in request.files:
            pdf_file = request.files["recipe_file"]
            if pdf_file and pdf_file.filename.endswith(".pdf"):
                try:
                    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
                    recipe_text = "\n".join([page.get_text() for page in doc])
                except Exception as e:
                    print("PDF extraction error:", e)

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
