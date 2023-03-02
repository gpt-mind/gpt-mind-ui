<script lang="ts">

    import OpenAI from 'openai-api';
    import { setUserKey, userKey } from '$lib/llm';
    import { Mind } from '$lib/Mind';
    import { onMount } from 'svelte';
    import MicroChat from '$lib/MicroChat';
    import { config } from '$lib/config';
    import { Automatic111 } from '$lib/Automatic111';
    
    onMount(() => {
        async function complete(mind: any, agent: string, query: any, options: any) {
            const a = mind.agents.find((a: any) => a.key === agent);
            if(!a) return query;
            const { prompt, responseFields } = a.value;
            return await prompt.complete(query, config.openai.key, options, responseFields);
        }
        let microChat: any;
        const iChing = '䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿'
        const mind = new Mind({
        "stateMap": {},
        "bindings": {
            "input": ["love"],
            "love": ["fear"],
            "fear": ["hate"],
            "hate": ["despair"],
            "despair": ["hope"],
            "hope": ["output"],
            "excitement": ["output"],
            "output": []
        },
        "agents": {
            "love": { "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as a person who is deeply in love", "responseFields": ["love", "hexagram"] },
            "fear": { "prompt": "{{hexagram}} respond to the statement {{love}} in the first-person as a person who is deeply afraid", "responseFields": ["fear", "hexagram"] },
            "hate": { "prompt": "{{hexagram}} respond to the statement {{fear}} in the first-person as a person who is filled with hate", "responseFields": ["hate", "hexagram"] },
            "despair": { "prompt": "{{hexagram}} respond to the statement {{hate}} in the first-person as a person who is in despair", "responseFields": ["despair", "hexagram"] },
            "hope": { "prompt": "{{hexagram}} respond to the statement {{despair}} in the first-person as a person who has regained hope", "responseFields": ["hope", "hexagram"] },
            "excitement": { "prompt": "{{hexagram}} respond to the statement {{despair}} in the first-person as a person who has become excited about their life", "responseFields": ["excitement", "hexagram"] }
        },
        "sources": {
            "love": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
            "fear": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
            "hate": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
            "despair": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
            "hope": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
            "excitement": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
            "output": (mind: any, agent: any, query: any, options: any) => mind.stateMap
        },
        "start": { "input": "I believe that love is the most powerful force in the universe." }
        });

        microChat = new MicroChat(
            'app', 
            ['Agent', 'Human'],
            async (message: any, user: any, chat: any) => {
                // trim leading and trailing whitespace
                message = message.trim();
                if(!userKey) {
                    config.openai.key = message;
                    microChat.setNotification('Great! You\'re all set to start chatting with the AI.');
                    return;
                }
                if(message.startsWith('sk-')) {
                    config.openai.key = message;
                    microChat.setNotification('Your API key has been updated.');
                    return;
                }
                if(!chat.getNotification().includes(message)) chat.respond(message, user);
                if(user === 'Human') {
                    await mind.input('input', message);
                } else {
                    microChat.addChatMessage('Agent', message);
                }
            }, {
                showSendButton: true,
                showTypingIndicator: true,
                showChatHistory: true,
                history: [{ message: 'intelligent sentient interface - type anything in the text box below to discuss any topic.'}],
            }
        );
        microChat.setNotification(userKey 
            ? 'Great! You\'re all set to start chatting with the AI.' 
            : 'Enter your OpenAI API key in the chat input at the bottom of this page to get started.'
        );
    
        const agentNames = ["love", "hate", "fear", "despair", "hope"];
        
        agentNames.forEach((e,i) => mind.on(`after_${e}`, (event: string, mind: any, agent: string, binding: string) => 
            (agent !== 'input' || (agent === 'input' && binding === 'love')) ? microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent]) : ''
        ));
        mind.on(`after_output`, (event: string, mind: any, agent: string, binding: string) => 
            microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent])
        )
        mind.on(`after_hope`, (event: string, mind: any, agent: string, binding: string) => 
            microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap.hope)
        )
    });
    
    </script>
    
    <style>
    
    </style>
    
    <div id="app"></div>
    