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
            const { prompt, responseFields } = a;
            const result = await prompt.complete(query, options, responseFields);
            return result.data.choices[0].text;
        }
        let microChat: any;
        const mind = new Mind({
            "stateMap": {},
            "bindings": {
                "input": ["agent1"],
                "agent1": ['agent2'],
                "agent2": ['agent3'],
                "agent3": ['output', 'think'],
                "think": ["visualize"],
                "visualize": ["image"],
                "image": ["output"],
                "output": [],
            },
            "agents": {
                "agent1": { "prompt": "Given the input {{input}} and the hexagram {{hexagram}} carrying your subjective state (out of the possible ䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿), respond with an statement representing your best understanding of the statement, as well as with the hexagram given, or one of your choosing representing your updated subjective state.", "responseFields": ["agent1", "hexagram"] },
                "agent2": { "prompt": "Given the input {{agent1}} and the hexagram {{hexagram}} carrying your subjective state (out of the possible ䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿), respond with an statement representing your best response of the statement, as well as with the hexagram given,  or one of your choosing representing your updated subjective state.", "responseFields": ["agent2", "hexagram"] },
                "agent3": { "prompt": "Given the inputs '{{agent1}}' and '{{agent2}}' and the hexagram {{hexagram}} (out of the possible ䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿), respond with an statement representing your best response of the statement (or an empty statement if that is the best response), as well as with a new hexagram of your choosing representing your updated subjective state.", "responseFields": ["agent3", "hexagram"] },
                "think": { "prompt": "Given the inputs '{{input}}' and '{{agent3}}'' and the hexagram {{hexagram}} (out of the possible ䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿), respond with candid internal commentary free of social mind about the response (or no internal commentary if that is the best response), as well as with the hexagram given, or one of your choosing representing your updated subjective state.", "responseFields": ["think", "hexagram"] },
                "visualize": { "prompt": `generate a detailed visual description of the imagery in the statements "{{agent3}}" "{{think}}" if it contains imagery. Otherwise respond with an empty value`, "responseFields": ["imagery"] },
            },
            start: { "input": "I wonder what would happen if we reran the Chinese Room thought experiment while applying the rules of quantum mechanics..", },
            sources: {
                "agent1": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "agent2": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "agent3": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "agent4": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "think": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "visualize": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "image": (mind: any, agent: any, query: any, options: any) => Automatic111.txt2img(query, "", { steps: 20 }),
                "output": (mind: any, agent: any, query: any, options: any) => mind.stateMap.agent3,
            }
        });
    
        mind.on('after_output', (event: string, mind: any) => 
            microChat.addChatMessage('AI', mind.stateMap.output) 
        );
        ['agent1','agent2','agent3'].forEach((key) => 
            mind.on(`after_${key}`, (event: string, mind: any) => 
                microChat.addToPanel(key, mind.stateMap[key]) 
            )
        );
        ['think','visualize'].forEach((key) => 
            mind.on(`after_${key}`, (event: string, mind: any) => 
                microChat.addToPanel(key, mind.stateMap[key]) 
            )
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
    
    });
    
    </script>
    
    <style>
    
    </style>
    
    <div id="app"></div>
    