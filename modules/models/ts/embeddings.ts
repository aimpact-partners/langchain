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
  }

  #client;
  #pineconeIndex;

  async init() {
    this.#client = new PineconeClient();
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
    //   new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY }),
    //   { index }
    // );

    // console.log(2.6, "after", vectorStore);
    // const results = await vectorStore.similaritySearch("pinecone", 1, {
    //   foo: "bar",
    // });
    // console.log(2.7, results);
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

  async search(question: string) {
    if (!this.#vectorStore) {
      await this.init();
    }

    /* Search the vector DB independently with meta filters */
    const results = await this.#vectorStore.similaritySearch(question, 1, {});
    // console.log("similarity results", results);
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
    // console.log("query response", response);
    return response.text;
  }
}
