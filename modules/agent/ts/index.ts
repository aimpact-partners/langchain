import { OpenAI } from "langchain/llms/openai";
import { ReactiveModel } from "@beyond-js/reactive-2/model";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";

console.log("update Agent code");

interface IAgentAPI {}
export /*bundle*/ class AgentAPI extends ReactiveModel<IAgentAPI> {
  #model;
  get model() {
    return this.#model;
  }

  async init(input: string) {
    const model = new ChatOpenAI({ openAIApiKey: process.env.OPEN_AI_KEY, temperature: 0 });
    const tools = [
      new SerpAPI(process.env.SERPAPI_API_KEY, {
        location: "Austin,Texas,United States",
        hl: "en",
        gl: "us",
      }),
      new Calculator(),
    ];

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "chat-zero-shot-react-description",
    });
    console.log("Loaded agent.");

    input = input ?? `Who is Olivia Wilde's boyfriend?`;

    console.log(`Executing with input "${input}"...`);

    const result = await executor.call({ input });

    console.log(`Got output ${result.output}`);

    console.log(`Got intermediate steps ${JSON.stringify(result.intermediateSteps, null, 2)}`);
  }
}
