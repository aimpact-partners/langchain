import * as dotenv from "dotenv";
import { ReactiveModel } from "@beyond-js/reactive/model";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

dotenv.config();
interface IEmbeddings {}
export /*bundle*/ class EmbeddingsManager extends ReactiveModel<IEmbeddings> {
  #model;
  #vectorStore;

  constructor(model) {
    super();
    this.#model = model;
  }

  async set() {
    console.log(2.1, globalThis.baseUrl, globalThis.baseDir);
    // PineconeClient ------

    const client = new PineconeClient();
    console.log(2.2, "setEmbeddings", client, process.env.PINECONE_API_KEY);
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    console.log(2.3, client, process.env.PINECONE_INDEX);
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    console.log(2.4, pineconeIndex);

    console.log(2.5, !!PineconeStore.fromDocuments);
    await PineconeStore.fromDocuments(
      this.#model.docs.items,
      new OpenAIEmbeddings({ openAIApiKey: process.env.openAIApiKey }),
      {
        pineconeIndex,
      }
    );
    console.log(2.6, "after");

    this.#vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.openAIApiKey }),
      { pineconeIndex }
    );

    console.log(2.7, "this.#vectorStore", this.#vectorStore);

    //------ PineconeClient

    // HNSWLib --- Load the docs into the vector store
    // this.#vectorStore = await HNSWLib.fromDocuments(
    //   docs,
    //   new OpenAIEmbeddings({ openAIApiKey: config.params.openia.key })
    // );
    // console.log(10, this.#vectorStore);
    // const baseCompressor = LLMChainExtractor.fromLLM(this.#model);
    // this.#retriever = new ContextualCompressionRetriever({
    //   baseCompressor,
    //   baseRetriever: this.#vectorStore.asRetriever(),
    // });
    // console.log(11, this.#model, this.#retriever);
  }
}
