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
                "agent1": { "prompt": "Given the input {{input}} and the hexagram {{hexagram}} carrying your subjective state (out of the possible ䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿), respond with an statement representing your best understanding of the statement, as well as with the hexagram given, or one of your choosing representing your updated subjective state.", "responseFields": ["interpret", "hexagram"] },
                "agent2": { "prompt": "Given the input {{interpret}} and the hexagram {{hexagram}} carrying your subjective state (out of the possible ䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿), respond with an statement representing your best response of the statement, as well as with the hexagram given,  or one of your choosing representing your updated subjective state.", "responseFields": ["response", "hexagram"] },
                "agent3": { "prompt": "Given the inputs '{{interpret}}' and '{{response}}' and the hexagram {{hexagram}} (out of the possible ䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿), respond with an statement representing your best response of the statement (or an empty statement if that is the best response), as well as with a new hexagram of your choosing representing your updated subjective state.", "responseFields": ["output", "hexagram"] },
                "think": { "prompt": "Given the inputs '{{input}}' and '{{output}}'' and the hexagram {{hexagram}} (out of the possible ䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿), respond with candid internal commentary free of social mind about the response (or no internal commentary if that is the best response), as well as with the hexagram given, or one of your choosing representing your updated subjective state.", "responseFields": ["think", "hexagram"] },
                "visualize": { "prompt": `generate a detailed visual description of the imagery in the statements "{{response}}" "{{think}}" if it contains imagery. Otherwise respond with an empty value`, "responseFields": ["image", "hexagram"] },
            },
            start: { "input": "I wonder what would happen if we reran the Chinese Room thought experiment while applying the rules of quantum mechanics..", },
            //start: { "input": "Do you remember that day on our honeymoon when we saw the Golden Gate bridge?", },
            sources: {
                "agent1": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "agent2": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "agent3": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "think": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "visualize": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "image": (mind: any, agent: any, query: any, options: any) => Automatic111.txt2img(query, "", { steps: 20 }),
                "output": (mind: any, agent: any, query: any, options: any) => mind.stateMap.agent3,
            }
        });
    
        mind.on('after_think', (event: string, mind: any) => 
            microChat.addChatMessage('AI', mind.stateMap.output) 
        );

        ['agent1','agent2','agent3','think','visualize'].forEach(e => mind.on(`after_${e}`, (event: string, mind: any) => 
            microChat.addToPanel('panel1', Object.keys(mind.stateMap).map(e => `${e}: ${mind.stateMap[e]}`).join('\n')) 
        ));
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
    