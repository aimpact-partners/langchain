import { ChainAPI } from "@aimpact/langchain/api";
import { ReactiveModel } from "@beyond-js/reactive/model";

interface IChainModel {}

export /*actions*/ /*bundle*/
class ChainModel extends ReactiveModel<IChainModel> {
  #api = new ChainAPI();

  async initialize() {
    await this.#api.init();
    return this.#api.ready;
  }

  query(query: string, topic: string) {
    return this.#api.query(query, topic);
  }
}
