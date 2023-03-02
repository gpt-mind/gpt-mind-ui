/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { getPromptDefinition } from "./prompts";
import { config } from "./config";

export class Mind {
    stateMap: any
    bindings: any
    agents: any
    sources: any
    start: any
    events: any
    constructor(public config: any) {
        this.events = {};
        this.run = this.run.bind(this);
        this.stateMap = config.stateMap;
        this.bindings = config.bindings;
        this.sources = config.sources;
        this.agents = Object.keys(config.agents).map((key) => ({ 
            key, value: { prompt: getPromptDefinition(config.agents[key].prompt), responseFields: config.agents[key].responseFields }
        }));
        this.start = config.start;
        if(this.start) {
            const keys = Object.keys(this.start);
            keys.forEach((key) => this.input(key, this.start[key]));
        }
    }

    public on(event: string, callback: (event: string, output: string, agent: string, binding: string) => void) {
        if(!this.events[event]) { this.events[event] = []; }
        this.events[event].push(callback);
    }

    public once(event: string, callback: (event: string, output: string, agent: string, binding: string) => void) {
        const cb = (event: string, output: string, agent: string, binding: string) => {
            this.off(event, cb);
            callback(event, output, agent, binding);
        }
        this.on(event, cb);
    }

    public off(event: string, callback: (event: string, output: string, agent: string, binding: string) => void) {
        if(!this.events[event]) { return; }
        this.events[event] = this.events[event].filter((cb: (output: string) => void) => cb !== callback);
    }

    public emit(event: string, output: any, agent: string, binding: string) {
        if(this.events[event])this.events[event].forEach((cb: (event: string, output: any, agent: string, binding: string) => void) => cb(event, output, agent, binding));
        if(event.endsWith('*')) {
            const tevent = event.substring(0, event.length - 1);
            const events = Object.keys(this.events).filter((key) => key.startsWith(tevent));
            events.forEach((key) => this.events[key].forEach((cb: (event: string, output: any, agent: string, binding: string) => void) => cb(event, output, agent, binding)));
        }
        if(this.events['*']) this.events['*'].forEach((cb: (event: string, output: any, agent: string, binding: string) => void) => cb(event, output, agent, binding));
    }

    public async input(agent: string, query: string) {
        this.stateMap.input = query;
        this.stateMap[agent] = query;
        await this.run(agent);
    }

    public async run(agent: string) {
        // get the output bindings
        const bindings = this.bindings[agent];
        if(!bindings) { throw new Error(`No bindings for agent ${agent}`); }
        const agentPromises: any = [];
        const varSetPromises: any = [];
        for(const binding of bindings) {
            const { value } = this.agents.find(async ({ key,}: any) => key === binding);
            const { prompt, responseFields } = value;
            if(prompt) {
                const callAgent = async (agent: string, binding: string) => {
                    this.emit(`before_${binding}`, this, agent, binding);
                    if(this.sources[binding]) {
                        const jsonResult = await this.sources[binding](this, agent, this.stateMap, { temperature: 0.9 }, responseFields ? responseFields : ["result"]);
                        if(jsonResult) Object.keys(jsonResult).forEach((key) => this.stateMap[key] = jsonResult[key]);
                    } else { 
                        const jsonResult = await prompt.complete(this.stateMap, config.openai.key, { temperature: 0.9 }, responseFields ? responseFields : ["result"]);
                        if(jsonResult) Object.keys(jsonResult).forEach((key) => this.stateMap[key] = jsonResult[key]);
                    }
                    this.emit(`after_${binding}`, this, agent, binding);
                    return this.run(binding);
                }
                agentPromises.push(callAgent(agent, binding));
            }
            else  {
                const callAgent = async (agent: string, binding: string) => {
                    if(binding !== "") {
                        this.stateMap[binding] = this.stateMap[agent]
                        this.emit(`after_${binding}`, this, agent, binding);
                        this.run(binding);
                    } else {
                        this.stateMap[`${binding}_result`] = this.stateMap[agent]
                        this.emit(`${binding}_result`, this, agent, binding);
                        this.run(binding);
                    }
                }
                varSetPromises.push(callAgent(agent, binding));
            }
        }
        await Promise.all(agentPromises);
        await Promise.all(varSetPromises);
    }

    public async complete(agent: any,  query: string, options: any) {
        return agent.complete(query, options);
    }
}