import zipfile
from pathlib import Path

import requests

URL = "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ZIP_PATH = DATA_DIR / "ml-latest-small.zip"


def main():
  DATA_DIR.mkdir(exist_ok=True)

  if (DATA_DIR / "ml-latest-small").exists():
    print("Dataset já baixado.")
    return

  print("Baixando MovieLens...")
  response = requests.get(URL, timeout=60)
  response.raise_for_status()
  ZIP_PATH.write_bytes(response.content)

  print("Extraindo arquivos...")
  with zipfile.ZipFile(ZIP_PATH) as zf:
    zf.extractall(DATA_DIR)

  ZIP_PATH.unlink()
  print(f"Arquivos em: {DATA_DIR / 'ml-latest-small'}")


if __name__ == "__main__":
    main()