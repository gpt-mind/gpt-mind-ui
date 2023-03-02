
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
			if (!a) return query;
			const { prompt, responseFields } = a.value;
			return await prompt.complete(query, config.openai.key, options, responseFields);
		}
		let microChat: any;
		const iChing = '䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿';
		const mind = new Mind({
            "stateMap": {
                "intensity1": 0,
                "intensity2": 0,
                "intensity3": 0,
                "intensity4": 0,
                "intensity5": 0,
            },
            "bindings": {
                "input": ["Analytic"],
                "Analytic": ["Fear"],
                "Fear": ["Sorrow"],
                "Sorrow": ["Anger"],
                "Anger": ["Joy"],
                "Joy": ["Integrating"],
                "Integrating": ["Imagery"],
                "Imagery": ["output"],
                "output": []
            },
            "agents": {
                "Analytic": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as an unusually analytical person with intensity {{intensity1}} of 10.",
                    "responseFields": ["Analytic", "hexagram", "intensity1"]
                },
                "Fear": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Fear with intensity {{intensity2}} of 10.",
                    "responseFields": ["Fear", "hexagram", "intensity2"]
                },
                "Sorrow": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Sorrow with intensity {{intensity3}} of 10.",
                    "responseFields": ["Sorrow", "hexagram", "intensity3"]
                },
                "Anger": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Anger with intensity {{intensity4}} of 10.",
                    "responseFields": ["Anger", "hexagram", "intensity4"]
                },
                "Joy": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Joy with intensity {{intensity5}} of 10.",
                    "responseFields": ["Joy", "hexagram", "intensity5"]
                },
                "Integrating": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person, incorporating the perspectives of {{Analytic}}, {{Fear}}, {{Sorrow}}, {{Anger}}, and {{Joy}} into a single, coherent response.",
                    "responseFields": ["Integrating", "hexagram"]
                },
                "Imagery": {
                    "prompt": "{{hexagram}} generate a visual description of the contents of the statements '{{input}}', '{{Analytic}}', '{{Fear}}', '{{Sorrow}}', '{{Anger}}', and '{{Joy}}'. If the statements contain no imagery, generate an empty string ('')",
                    "responseFields": ["Imagery", "hexagram"]
                },
            },
            "sources": {
                "Analytic": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Fear": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Sorrow": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Anger": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Joy": (mind: any, agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Integrating": (mind: any,agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "Imagery": (mind: any,agent: any, query: any, options: any) => complete(mind, agent, query, options),
                "output": (mind: any, agent: any, query: any, options: any) => mind.stateMap,
                "dummy": (mind: any, agent: any, query: any, options: any) => mind.stateMap
            },
            "start": {
                "input": "It is a true pleasure to meet you."
            }
        });

		microChat = new MicroChat(
			'app',
			['Agent', 'Human'],
			async (message: any, user: any, chat: any) => {
				// trim leading and trailing whitespace
				message = message.trim();
				if (!userKey) {
					config.openai.key = message;
					microChat.setNotification("Great! You're all set to start chatting with the AI.");
					return;
				}
				if (message.startsWith('sk-')) {
					config.openai.key = message;
					microChat.setNotification('Your API key has been updated.');
					return;
				}
				if (!chat.getNotification().includes(message)) chat.respond(message, user);
				if (user === 'Human') {
					await mind.input('input', message);
				} else {
					microChat.addChatMessage('Agent', message);
				}
			},
			{
				showSendButton: true,
				showTypingIndicator: true,
				showChatHistory: true,
				history: [
					{
						message:
							'intelligent sentient interface - type anything in the text box below to discuss any topic.'
					}
				]
			}
		);
		microChat.setNotification(
			userKey
				? "Great! You're all set to start chatting with the AI."
				: 'Enter your OpenAI API key in the chat input at the bottom of this page to get started.'
		);

		const agentNames = ["Analytic", "Fear", "Sorrow", "Anger", "Joy", "Integrating"];

		agentNames.forEach((e: any, i: any) =>
			mind.on(`after_${e}`, (event: string, mind: any, agent: string, binding: string) =>
				agent !== 'input' || (agent === 'input' && binding === 'love')
					? microChat.addChatMessage(
							`${mind.stateMap.hexagram || ''} ${agent}`,
							mind.stateMap[agent]
					)
					: ''
			)
		);
        ["Analytic", "Fear", "Sorrow", "Anger", "Joy", "Integrating"].forEach(e => mind.on(`${e}_result`, (event: string, mind: any, agent: string, binding: string) =>
			microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[e])
		));
        mind.on(`output_result`, (event: string, mind: any, agent: string, binding: string) =>
			microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent + '_result'])
		);
		mind.on(`after_output`, (event: string, mind: any, agent: string, binding: string) =>
			microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent])
		);
		mind.on(`after_Imagery`, (event: string, mind: any, agent: string, binding: string) =>
			microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap.Integrating)
		);
	});
</script>

<div id="app" />

<style>
</style>
