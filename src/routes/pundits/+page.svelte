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
                "input": ["Rachel Maddow"],
                "Rachel Maddow": ["Sean Hannity"],
                "Sean Hannity": ["Anderson Cooper"],
                "Anderson Cooper": ["Don Lemon"],
                "Don Lemon": ["Tucker Carlson"],
                "Tucker Carlson": ["moderator"],
                "moderator": ["output"],
                "output": [],
            },
            "agents": {
                "Rachel Maddow": { "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as Rachel Maddow", "responseFields": ["Rachel Maddow", "hexagram"] },
                "Sean Hannity": { "prompt": "{{hexagram}} respond to the statement {{Rachel Maddow}} in the first-person as Sean Hannity", "responseFields": ["Sean Hannity", "hexagram"] },
                "Anderson Cooper": { "prompt": "{{hexagram}} respond to the statement {{Sean Hannity}} in the first-person as Anderson Cooper", "responseFields": ["Anderson Cooper", "hexagram"] },
                "Don Lemon": { "prompt": "{{hexagram}} respond to the statement {{Anderson Cooper}} in the first-person as Don Lemon", "responseFields": ["Don Lemon", "hexagram"] },
                "Tucker Carlson": { "prompt": "{{hexagram}} respond to the statement {{Don Lemon}} in the first-person as Tucker Carlson", "responseFields": ["Tucker Carlson", "hexagram"] },
                "moderator": { "prompt": "As a moderator, what question would you ask the panel in response to their discussion on {{Tucker Carlson}}?", "responseFields": ["input", "hexagram"] }
            },
            "sources": {
                "Rachel Maddow": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Sean Hannity": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Anderson Cooper": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Don Lemon": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Tucker Carlson": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "moderator": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "output": (mind: any, agent: any, query: any, options: any) => mind.stateMap
            },
            "start": { "input": "What are your predictions for the outcome of the 2022 midterm elections?" }
            }
        );

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
    
        const agentNames =  ["Rachel Maddow", "Sean Hannity", "Anderson Cooper", "Don Lemon", "Tucker Carlson", "moderator"];
        
        agentNames.forEach((e,i) => mind.on(`after_${e}`, (event: string, mind: any, agent: string, binding: string) => 
            (agent !== 'input' || (agent === 'input' && binding === 'Rachel Maddow')) ? microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent]) : ''
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
    