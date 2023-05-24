import { ReactiveModel } from "@beyond-js/reactive/model";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";

interface IEmbeddings {}
export /*bundle*/ class EmbeddingsManager extends ReactiveModel<IEmbeddings> {
  #chain;
  #vectorStore;

  constructor(chain) {
    super();
    this.#chain = chain;
    this.#client = new PineconeClient();
  }

  #client;
  #pineconeIndex;

  async init() {
    await this.#client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    const indexes = await this.#client.listIndexes();
    if (!indexes.length && !indexes.includes(process.env.PINECONE_INDEX_NAME)) {
      console.error("No existe el indice");
      return;
    }

    const pineconeIndex = this.#client.Index(process.env.PINECONE_INDEX_NAME);
    const embedding = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY });
    const docs = this.#chain.documents.items;
    await PineconeStore.fromDocuments(docs, embedding, { pineconeIndex });

    this.#vectorStore = await PineconeStore.fromExistingIndex(embedding, { pineconeIndex });
  }

  async search(question: string) {
    if (!this.#vectorStore) {
      await this.init();
    }

    /* Search the vector DB independently with meta filters */
    const results = await this.#vectorStore.similaritySearch(question, 1, {});
    return results;
  }

  async query(question: string) {
    if (!this.#vectorStore) {
      await this.init();
    }

    const model = new OpenAI({ openAIApiKey: process.env.OPEN_AI_KEY });
    const chain = VectorDBQAChain.fromLLM(model, this.#vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    });
    const response = await chain.call({ query: question });
    return response.text;
  }
}
