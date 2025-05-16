from flask import Blueprint, render_template, request
from ai.analyzer import analyze_ingredients

main = Blueprint('main', __name__)

@main.route("/", methods=["GET", "POST"])
def index():
    result = None
    if request.method == "POST":
        recipe_text = request.form.get("recipe")
        if recipe_text:
            result = analyze_ingredients(recipe_text)
    return render_template("index.html", result=result)

