import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
import * as dotenv from "dotenv";
dotenv.config();

export /*bundle*/ class EmbeddingsManager {
  #embedding;
  #chain;
  #model;
  #vectorStore;

  constructor(chain) {
    this.#chain = chain;
    this.#client = new PineconeClient();
    this.#model = new OpenAI({ openAIApiKey: process.env.OPEN_AI_KEY });
    this.#embedding = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY });
  }

  #client;
  #pineconeIndex;

  #map = new Map();
  async init() {
    await this.#client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
  }

  async vector() {
    // TODO agregar logica para creacion de indices y gestion
    // pinecode pago
    // const indexes = await this.#client.listIndexes();
    // if (!indexes.length && !indexes.includes(process.env.PINECONE_INDEX_NAME)) {
    //   console.warn(2, "No existe el indice");
    //   this.createIndex(knowledge, embedding);
    //   return;
    // }

    const pineconeIndex = this.#client.Index(process.env.PINECONE_INDEX_NAME);
    this.#vectorStore = await PineconeStore.fromExistingIndex(this.#embedding, { pineconeIndex });
    this.#map.set(pineconeIndex, this.#vectorStore);
  }

  async createIndex(name: string, embedding) {
    const docs = this.#chain.documents.items;
    //create
    console.log(2.1, `//create index`, name);

    // TODO Este codigo puede tardar aproximadamente 1minuto en mostrar el indice luego de generado
    const index = await this.#client.createIndex({
      createRequest: {
        name: name,
        dimension: process.env.PINECODE_INDEX_DIMENSION,
        metric: process.env.PINECODE_INDEX_METRIC,
      },
    });
    console.log(2.2, `// index created:`, index);

    await PineconeStore.fromDocuments(docs, embedding, { index });
  }

  async update() {
    await this.init();
    const pineconeIndex = this.#client.Index(process.env.PINECONE_INDEX_NAME);
    await PineconeStore.fromDocuments(this.#chain.documents.items, this.#embedding, { pineconeIndex });
  }

  async search(question: string, knowledge: string) {
    if (!this.#vectorStore) {
      await this.init();
      await this.vector();
    }

    /* Search the vector DB independently with meta filters */
    const results = await this.#vectorStore.similaritySearch(question, 1, {});
    return { status: true, data: results };
  }

  async query(question: string, knowledge: string) {
    if (!this.#vectorStore) {
      await this.init();
      await this.vector();
    }

    const chain = VectorDBQAChain.fromLLM(this.#model, this.#vectorStore, { k: 1, returnSourceDocuments: true });
    const response = await chain.call({ query: question });
    return { status: true, data: response.text };
  }
}
