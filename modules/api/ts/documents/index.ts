import { CharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { downloadFiles } from "./download";

export /*bundle*/ class DocsManager {
  #chain;
  #splitter = new CharacterTextSplitter();

  #items;
  get items() {
    return this.#items;
  }

  constructor(chain) {
    this.#chain = chain;
  }

  async prepare(path: string = "docs") {
    console.log("docs prepare", path);

    if (!path) {
      console.error("path not defined");
      return;
    }

    const tempPath = await downloadFiles(path);
    console.log("reading folder:", tempPath);

    const loader = new DirectoryLoader(tempPath, {
      ".docx": path => new DocxLoader(path),
      ".pdf": path => new PDFLoader(path),
      ".txt": path => new TextLoader(path),
    });
    this.#items = await loader.loadAndSplit(this.#splitter);
    console.log("docs items", this.#items.length);
  }
}
