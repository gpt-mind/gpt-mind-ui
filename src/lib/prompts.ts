/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from "openai-api";

export function extractReplacementTokens(inputStr: string) {
    const regex = /\{\{([^}]+)\}\}/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(inputStr)) !== null) {
        tokens.push(match[1]);
    }
    return tokens;
}
export function getPromptReplacementFunction(prompt: any, arrayJoin = ",", quote = '"') {
    return (params: { [x: string]: any; }) => {
        let output = prompt;
        const keys = Object.keys(params);
        for (const key of keys) {
            let val = params[key];
            if (Array.isArray(val)) {
                val = `${quote}${val.join(`${quote}${arrayJoin}${quote}`)}${quote}`;
            }
            output = output.replace(`{{${key}}}`, params[key]);
        }
        return output;
    };
}
export function validatePrompt(prompt: any, params: { [x: string]: any; }) {
    const missing = [];
    const tokens = extractReplacementTokens(prompt);
    for (const token of tokens) {
        if (!params[token]) {
            missing.push(token);
        }
    }
    return missing.length ? true : missing;
}
export const defaultSettings = {
    maxTokens: 1024,
    temperature: 0.9,
    topP: 1,
    frequencyPenalty: 0.7,
    presencePenalty: 0.7,
    bestOf: 1,
    n: 1,
    stream: false,
    stop: ["\n"],
    engine: "text-davinci-003",
};
function buildExamplePreamble(responseFields: any) {
    const pscript = (output: string) => `WHEN ANSWERING: Along with the requested output, include a hexagram indicating your subjective internal state. Answer ONLY with a JSON object with fields "${responseFields.join('","')}" FOR EXAMPLE:
{ "hexagram": "䷧", "${output}": "When considering the Chinese Room thought experiment through a quantum mechanical lens, we could interpret it in terms of quantum information processing. In this interpretation, the man in the room and the rules he consults could be seen as classical bits of information, while the Chinese characters and the English output could be seen as quantum states." }
{ "hexagram": "䷔", "${output}": "Magnetic motors, also known as permanent magnet motors or PM motors, are electric motors that use magnets to generate rotational motion. They are a promising area of research for various applications, including electric vehicles, wind turbines, and industrial machinery, due to their potential for high efficiency and low maintenance." }
YOUR ANSWER:
{ "hexagram": "`;
    return pscript(responseFields[0]);
}
export function getPromptDefinition(prompt: string) {
    const tokens = extractReplacementTokens(prompt);
    return {
        prompt,
        params: tokens,
        validate: (params: { [x: string]: any; }) => {
            validatePrompt(prompt, params);
        },
        replace: (params: { [x: string]: any; }) => {
            let output = prompt;
            const keys = Object.keys(params);
            for (const key of keys) {
                output = output.replace(`{{${key}}}`, params[key]);
            }
            return output;
        },
        async complete(params: any, apiKey: any, settings: any, responseFields = ['result']) {
            this.validate(params)
            const _settings = Object.assign({}, defaultSettings, settings || {});
            const openapi = new OpenAI(apiKey);
            _settings.prompt = this.replace(params);
            const ex = buildExamplePreamble(responseFields);
            _settings.prompt = `${_settings.prompt}${ex}`;
            let response: any = await openapi.complete(_settings);
            response = response.data.choices[0].text;
            let requestLP: any = ex.split('\n');
            requestLP = requestLP[requestLP.length-1];
            requestLP = requestLP.replace(/\\(?!n)/g, '')
            const parsedResponse = JSON.parse(`${requestLP}${response}`);
            const result: any = responseFields.reduce((acc: any, field: any) => {
                acc[field] = parsedResponse[field];
                return acc;
            }, {} );
            return result;
        }
    };
}
