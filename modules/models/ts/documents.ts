import { join } from "path";
import { ReactiveModel } from "@beyond-js/reactive/model";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

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
    console.log(1, "readDocs");
    const loader = new DirectoryLoader(join(__dirname, "assets"), {
      ".docx": path => new DocxLoader("assets/introducing-beyond.docx"),
    });
    this.#items = await loader.loadAndSplit(this.#splitter);
    console.log(1.1, "docs items", this.#items.length);
  }
}
