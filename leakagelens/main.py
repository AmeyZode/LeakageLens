import typer

app = typer.Typer(help="LeakageLens CLI")

@app.command()
def audit(
    path: str = typer.Argument(".", help="The target directory or file to audit"),
    ai: str = typer.Option("fallback", "--ai", help="AI provider"),
):
    """Scan and audit machine learning codebases."""
    pass

if __name__ == "__main__":
    app()
