import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { ReactiveModel } from "@beyond-js/reactive/model";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
import { VectorDBQAChain } from "langchain/chains";
import { DocsManager } from "./documents";
import { EmbeddingsManager } from "./embeddings";

console.log("update code");

interface IChain {}
export /*bundle*/ class Chain extends ReactiveModel<IChain> {
  #retriever;

  #model;
  get model() {
    return this.#model;
  }

  #documents;
  get documents() {
    return this.#documents;
  }
  #embeddings;
  get embeddings() {
    return this.#embeddings;
  }

  constructor() {
    super();
    this.#model = new OpenAI({
      temperature: 0.2,
      openAIApiKey: process.env.OPEN_AI_KEY,
      modelName: "gpt-3.5-turbo",
    });

    this.#documents = new DocsManager(this);
    this.#embeddings = new EmbeddingsManager(this);
  }

  async init() {
    await this.#documents.read();
    // await this.#embeddings.init();

    console.log("chain ready");
  }

  async question(q: string) {
    /* Search the vector DB independently with meta filters */
    const results = await this.#embeddings.vectorStore.similaritySearch("modular programming ", 1, {
      source: "assets/introducing-beyond.docx",
    });
    console.log("similaritySearch results", results);

    /* Use as part of a chain (currently no metadata filters) */
    const model = new OpenAI();
    const chain = VectorDBQAChain.fromLLM(model, this.#embeddings.vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    });
    const response = await chain.call({ query: q });
    console.log("chain.call response", response);
  }

  async questionOLD(q: string) {
    console.log("q", q, !!this.#model, !!this.#retriever);
    const chain = RetrievalQAChain.fromLLM(this.#model, this.#retriever);

    const res = await chain.call({ query: q });

    console.log({ res });
    return res;
  }
}
