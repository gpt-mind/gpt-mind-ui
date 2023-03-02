{
    "stateMap": {},
    "bindings": {
        "input": ["Analytic Agent"],
        "Analytic Agent": ["Fear Agent", "Sorrow Agent", "Anger Agent", "Joy Agent", "Moderator Agent"],
        "Fear Agent": ["Analytic Agent", "Moderator Agent"],
        "Sorrow Agent": ["Analytic Agent", "Moderator Agent"],
        "Anger Agent": ["Analytic Agent", "Moderator Agent"],
        "Joy Agent": ["Analytic Agent", "Moderator Agent"],
        "Moderator Agent": ["Output Agent"],
        "Output Agent": []
    },
    "agents": {
        "Analytic Agent": {
            "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Analytic Agent",
            "responseFields": ["Analytic Agent", "hexagram"]
        },
        "Fear Agent": {
            "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Fear Agent",
            "responseFields": ["Fear Agent", "hexagram", "intensity"]
        },
        "Sorrow Agent": {
            "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Sorrow Agent",
            "responseFields": ["Sorrow Agent", "hexagram", "intensity"]
        },
        "Anger Agent": {
            "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Anger Agent",
            "responseFields": ["Anger Agent", "hexagram", "intensity"]
        },
        "Joy Agent": {
            "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Joy Agent",
            "responseFields": ["Joy Agent", "hexagram", "intensity"]
        },
        "Moderator Agent": {
            "prompt": "As a moderator, what question would you ask the panel in response to their discussion on {{input}}?",
            "responseFields": ["Moderator Agent", "hexagram"]
        },
        "Output Agent": {
            "prompt": "",
            "responseFields": []
        }
    },
    "sources": {
        "Analytic Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
        "Fear Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
        "Sorrow Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
        "Anger Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
        "Joy Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
        "Moderator Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
        "Output Agent": "(mind, agent, query, options) => mind.stateMap"
    },
    "start": {
        "input": "What do you want to talk about?"
    }
}


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
            "stateMap": {},
            "bindings": {
                "input": ["Analytic Agent"],
                "Analytic Agent": ["Fear Agent"],
                "Fear Agent": ["Sorrow Agent"],
                "Sorrow Agent": ["Anger Agent"],
                "Anger Agent": ["Joy Agent"],
                "Joy Agent": ["Integrating Agent"],
                "Integrating Agent": ["Output Agent"],
                "Output Agent": []
            },
            "agents": {
                "Analytic Agent": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Analytic Agent with intensity {{intensity1}} of 10.",
                    "responseFields": ["Analytic Agent", "hexagram", "intensity1"]
                },
                "Fear Agent": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Fear Agent with intensity {{intensity2}} of 10.",
                    "responseFields": ["Fear Agent", "hexagram", "intensity2"]
                },
                "Sorrow Agent": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Sorrow Agent with intensity {{intensity3}} of 10.",
                    "responseFields": ["Sorrow Agent", "hexagram", "intensity3"]
                },
                "Anger Agent": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Anger Agent with intensity {{intensity4}} of 10.",
                    "responseFields": ["Anger Agent", "hexagram", "intensity4"]
                },
                "Joy Agent": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person as the Joy Agent with intensity {{intensity5}} of 10.",
                    "responseFields": ["Joy Agent", "hexagram", "intensity5]
                },
                "Integrating Agent": {
                    "prompt": "{{hexagram}} respond to the statement {{input}} in the first-person, incorporating the perspectives of {{Analytic Agent}}, {{Fear Agent}}, {{Sorrow Agent}}, {{Anger Agent}}, and {{Joy Agent}}.",
                    "responseFields": ["Integrating Agent", "hexagram", "intensity"]
                },
                "Output Agent": {
                    "prompt": "",
                    "responseFields": []
                }
            },
            "sources": {
                "Analytic Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
                "Fear Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
                "Sorrow Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
                "Anger Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
                "Joy Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
                "Moderator Agent": "(mind, agent, query, options) => complete(mind, agent, query, options)",
                "Output Agent": "(mind, agent, query, options) => mind.stateMap"
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

		const agentNames = ['love', 'hate', 'fear', 'despair', 'hope'];

		agentNames.forEach((e, i) =>
			mind.on(`after_${e}`, (event: string, mind: any, agent: string, binding: string) =>
				agent !== 'input' || (agent === 'input' && binding === 'love')
					? microChat.addChatMessage(
							`${mind.stateMap.hexagram || ''} ${agent}`,
							mind.stateMap[agent]
					  )
					: ''
			)
		);
		mind.on(`after_output`, (event: string, mind: any, agent: string, binding: string) =>
			microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent])
		);
		mind.on(`after_hope`, (event: string, mind: any, agent: string, binding: string) =>
			microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap.hope)
		);
	});
</script>

<div id="app" />

<style>
</style>
