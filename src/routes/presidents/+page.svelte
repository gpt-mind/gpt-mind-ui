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
                "input": ["bush1"],
                "bush1": ["clinton"],
                "clinton": ['bush2'],
                "bush2": ['obama'],
                "obama": ['trump'],
                "trump": ["biden"],
                "biden": ["output"],
                "output": [],
            },
            "agents": {
                "bush1": { "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as George W. Bush", "responseFields": ["bush1", "hexagram"] },
                "clinton": { "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as Bill Clinton", "responseFields": ["clinton", "hexagram"] },
                "bush2": { "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as George H.W. Bush", "responseFields": ["bush2", "hexagram"] },
                "obama": { "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as Barack Obama", "responseFields": ["obama", "hexagram"] },
                "trump": { "prompt": "respond to the statement {{input}} in the first-person as Donald Trump", "responseFields": ["trump", "hexagram"] },
                "biden": { "prompt": "respond to the statement {{input}} in the first-person as Joe Biden", "responseFields": ["biden", "hexagram"] },
            },
            start: { "input": "What was your proudest achievement as President?", },
            //start: { "input": "Do you remember that day on our honeymoon when we saw the Golden Gate bridge?", },
            sources: {
                "bush1": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "clinton": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "bush2": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "obama": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "trump": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "biden": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
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
                if(user !== 'Human') {
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
    
        const agentNames = ["bush1", "clinton", "bush2", "obama", "trump", "biden"];
        
        agentNames.forEach((e,i) => mind.on(`after_${e}`, (event: string, mind: any, agent: string, binding: string) => 
            (agent !== 'input' || (agent === 'input' && binding === 'bush1')) ? microChat.addChatMessage(`${mind.stateMap.hexagram} ${agent}`, mind.stateMap[agent]) : ''
        ));
        mind.on(`after_output`, (event: string, mind: any, agent: string, binding: string) => 
            microChat.addChatMessage(`${mind.stateMap.hexagram} ${agent}`, mind.stateMap[agent])
        ) 
    });
    
    </script>
    
    <style>
    
    </style>
    
    <div id="app"></div>
    