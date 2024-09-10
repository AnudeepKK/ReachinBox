
import Groq from "groq-sdk";
import { config } from './keys';

const groq = new Groq({ apiKey: process.env.OPENAI_API_KEY });

export const getGroqChatCompletion = async (subject: string, content: string): Promise<string> => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that categorizes emails. Categorize the email as either 'Interested', 'Not Interested', or 'More information'. Respond with only the category.",
        },
        { role: "user", content: `Subject: ${subject}\n\nContent: ${content}` }
      ],
      model: "llama3-8b-8192",
    });

    const category = response.choices[0].message.content?.trim() || 'Uncategorized';
    console.log('Categorized as:', category);
    return category || 'Uncategorized';
  } catch (error) {
    console.error('Error fetching chat completion:', error);
    return 'Uncategorized';
  }
};


export const generateResponse = async (category: string, subject: string, content: string): Promise<string> => {
    try {
      let customPrompt = '';
  
      // Customize the response prompt based on the email category
      switch (category) {
        case 'Interested':
          customPrompt = "The sender has shown interest. Kindly ask them if they are willing to hop on to a demo call by suggesting available time slots.";
          break;
        case 'Not Interested':
          customPrompt = "The sender seems not interested. Politely acknowledge their response and thank them for their time.";
          break;
        case 'More information':
          customPrompt = "The sender is asking for more information. Provide additional details and offer to schedule a demo if they are interested.";
          break;
        default:
          customPrompt = "The email does not fit into a specific category. Respond politely and professionally based on the content.";
          break;
      }
  
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant responding to emails. Provide a concise, professional response that addresses the content of the email. Your response should be in the tone of a human assistant.But do not mention your name." },
          { role: "user", content: `Category: ${category}\nSubject: ${subject}\n\nContent: ${content}\n\nResponse type: ${customPrompt}` }
        ],
        model: "llama3-8b-8192",
      });
  
      const response = completion.choices[0].message.content?.trim() || 'No response generated';
      console.log('Generated response:', response);
      return response;
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return 'No response generated';
    }
  };
  