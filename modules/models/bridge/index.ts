import { ChainAPI } from "@aimpact/langchain/api";

export /*actions*/ /*bundle*/
class ChainModel {
  #api = new ChainAPI();

  async initialize() {
    await this.#api.init();
    return this.#api.ready;
  }

  query(query: string, topic: string) {
    return this.#api.query(query, topic);
  }
}
