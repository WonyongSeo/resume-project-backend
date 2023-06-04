// function stream
//      await openai()
// export stream

import { OpenAI } from "openai-streams/node";

const stream = async (req, res) => {
    try{
        const { type } = req.body;

        switch(type) {
            case 0:
                const [ draft_company, draft_position, draft_question, draft_experience ] = req.body.content;

                const draft = await OpenAI(
                    "chat", 
                    {
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                "role": "system",
                                "content": `[조건]
                
                                - [질문]에 대한 대답을 역피라미드 구조로 [활동 경험]을 중심으로 자세히 작성해 주세요.
                                - 지원자가 [활동 경험]을 시작했던 자세한 계기를 포함해 주세요.
                                - [활동 경험]의 결과와 그 결과를 달성할 수 있었던 이유에 대한 자세한 스토리를 만들어 포함해 주세요.
                                - 숫자를 통한 구체적인 수치를 사용해 주고, 모호한 단어는 구체적인 수치로 바꾸어 주세요.
                                - 지원자의 주관적인 생각을 없애고, 객관적인 요소들을 사용해 주세요.
                                - 감성적이고 자연스러운 느낌으로 작성해 주세요.`
                            },
                            {
                                "role":"user",
                                "content":`
                                
                                [지원하는 회사]
                                ${draft_company}
                
                                [지원하는 직무/직군]
                                ${draft_position}
                
                                [질문]
                                ${draft_question}
                
                                [활동 경험]
                                ${draft_experience}
                
                                [질문]에 대한 자기소개서를 작성하려 합니다. [조건]에 맞게 자기소개서를 작성해 주세요.`
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 1000,
                    },
                    { apiKey: process.env.OPEN_AI_KEY },
                    { mode: "raw" }
                );

                return res.status(200).json({
                    success: true,
                    type: type,
                    data: draft.data,
                });
            // case 1:
            // case 2:
            // case 3:
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.response
                ? error.response.data
                : "There was an issue on the server",
        });
    }
    
}

const simple_response = async (req, res) => {
    
}

// test.post("/simple-response", async (req, res) => {
//     try{
//         const { type, content } = req.body;
        
//         const response = await openai.createChatCompletion({
//             model: "gpt-3.5-turbo",
//             messages: [
//                 {
//                     "role": "user",
//                     "content": `${content}`
//                 }
//             ],
//             temperature: 0,
//             max_tokens: 1000,
//         });
//         return res.status(200).json({
//             success: true,
//             data: response.data.choices[0].message.content
//         });
//     } catch (error) {
//         return res.status(400).json({
//             success: false,
//             error: error.response
//                 ? error.response.data
//                 : "There was an issue on the server",
//         });
//     }
// });

export { stream }
