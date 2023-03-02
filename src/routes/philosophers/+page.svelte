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
                "input": ["socrates"],
                "socrates": ["plato"],
                "plato": ['aristotle'],
                "aristotle": ['descartes'],
                "descartes": ['kant'],
                "kant": ["nietzsche"],
                "nietzsche": ["output"],
                "output": [],
            },
            "agents": {
                "socrates": { "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as Socrates", "responseFields": ["socrates", "hexagram"] },
                "plato": { "prompt": "{{hexagram}} respond to the statement {{socrates}} in the first-person as Plato", "responseFields": ["plato", "hexagram"] },
                "aristotle": { "prompt": "{{hexagram}} respond to the statement {{plato}} in the first-person as Aristotle", "responseFields": ["aristotle", "hexagram"] },
                "descartes": { "prompt": "{{hexagram}} respond to the statement {{aristotle}} in the first-person as René Descartes", "responseFields": ["descartes", "hexagram"] },
                "kant": { "prompt": "respond to the statement {{descartes}} in the first-person as Immanuel Kant", "responseFields": ["kant", "hexagram"] },
                "nietzsche": { "prompt": "respond to the statement {{kant}} in the first-person as Friedrich Nietzsche", "responseFields": ["nietzsche", "hexagram"] },
            },
            start: { "input": "I wonder what would happen if we reran the Chinese Room thought experiment while applying the rules of quantum mechanics..", },
            //start: { "input": "Do you remember that day on our honeymoon when we saw the Golden Gate bridge?", },
            sources: {
                "socrates": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "plato": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "aristotle": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "descartes": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "kant": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "nietzsche": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "output": (mind: any, agent: any, query: any, options: any) => mind.stateMap,
            }
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
    
        const agentNames = ["socrates", "plato", "aristotle", "descartes", "kant", "nietzsche"];
        
        agentNames.forEach((e,i) => mind.on(`after_${e}`, (event: string, mind: any, agent: string, binding: string) => 
            (agent !== 'input' || (agent === 'input' && binding === 'socrates')) ? microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent]) : ''
        ));
        mind.on(`after_output`, (event: string, mind: any, agent: string, binding: string) => 
            microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent])
        ) 
    });
    
    </script>
    
    <style>
    
    </style>
    
    <div id="app"></div>
    