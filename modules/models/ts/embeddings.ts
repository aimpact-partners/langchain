import * as dotenv from "dotenv";
import { ReactiveModel } from "@beyond-js/reactive/model";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

dotenv.config();
interface IEmbeddings {}
export /*bundle*/ class EmbeddingsManager extends ReactiveModel<IEmbeddings> {
  #chain;
  #vectorStore;

  constructor(chain) {
    super();
    this.#chain = chain;
  }

  #client;
  #pineconeIndex;
  async init() {
    console.log(2.1, globalThis.baseUrl, globalThis.baseDir);
    // PineconeClient ------

    this.#client = new PineconeClient();
    console.log(2.2, "setEmbeddings", this.#client, process.env.PINECONE_API_KEY);
    await this.#client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    console.log(2.3, this.#client, process.env.PINECONE_INDEX);
    const index = await this.#client.createIndex({
      createRequest: {
        name: "example-index",
        dimension: 1024,
      },
    });
    console.log(2.4, pineconeIndex);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY }),
      { pineconeIndex }
    );

    console.log(2.6, "after", vectorStore);
  }

  async set() {
    console.log(2.5, !!PineconeStore.fromDocuments);
    // await PineconeStore.fromDocuments(
    //   this.#chain.documents.items,
    //   new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY }),
    //   {this.#pineconeIndex}
    // );

    console.log(2.7, "this.#vectorStore", this.#vectorStore);

    //------ PineconeClient

    // HNSWLib --- Load the docs into the vector store
    // this.#vectorStore = await HNSWLib.fromDocuments(
    //   docs,
    //   new OpenAIEmbeddings({ openAIApiKey: config.params.openia.key })
    // );
    // console.log(10, this.#vectorStore);
    // const baseCompressor = LLMChainExtractor.fromLLM(this.#chain);
    // this.#retriever = new ContextualCompressionRetriever({
    //   baseCompressor,
    //   baseRetriever: this.#vectorStore.asRetriever(),
    // });
    // console.log(11, this.#chain, this.#retriever);
  }

  async query() {
    // const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), { pineconeIndex });
  }
}
