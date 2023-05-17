import { join } from "path";
import { ReactiveModel } from "@beyond-js/reactive/model";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

interface IDocs {}
export /*bundle*/ class DocsManager extends ReactiveModel<IDocs> {
  #chain;
  #splitter = new CharacterTextSplitter();

  #items;
  get items() {
    return this.#items;
  }

  constructor(chain) {
    super();

    this.#chain = chain;
  }

  async read() {
    const path = join(__dirname, "docs");
    console.log(1, "readDocs on path:", path);
    const loader = new DirectoryLoader(path, {
      ".docx": path => new DocxLoader(path),
      ".pdf": path => new PDFLoader(path),
    });
    this.#items = await loader.loadAndSplit(this.#splitter);
    console.log(1.1, "docs items", this.#items.length);
  }
}
