const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config");
const { Configuration, OpenAIApi } = require("openai");
const userRoutes = require("./routes/user-routes");
const functions = require("firebase-functions");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use("/api", userRoutes.routes);

// const port_number = 5002
// app.listen(port_number, () => console.log(`server listening on port ${port_number}`));

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY  
});

const openai = new OpenAIApi(configuration);

app.get('/', (req, res) => res.status(200).send("connected"));
app.post("/simple-response", async (req, res) => {
    try{
        const { type, content } = req.body;
        
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "user",
                    "content": `${content}`
                }
            ],
            temperature: 0,
            max_tokens: 64,
        });
        return res.status(200).json({
            success: true,
            data: response.data.choices[0].message.content
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.response
                ? error.response.data
                : "There was an issue on the server",
        });
    }
});

app.post("/create-response", async (req, res) => {
    try{
        const { type } = req.body;
        
        switch (type) {
            case 0:
                const [ draft_company, draft_position, draft_question, draft_experience ] = req.body.content;

                const draft = await openai.createChatCompletion({
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
                    // messages: [
                    //     {
                    //         "role": "user",
                    //         "content": `
                    //                     [질문] : ${draft_question}
                    //                     [경험] : ${draft_experience}
                    //                     [질문]에 대한 자기소개서를 작성하려 합니다. 아래 조건에 맞게 자기소개서를 작성해 주세요.
                    //                     - [질문]에 대한 대답을 역피라미드 구조로 [경험]을 중심으로 자세히 작성해 주세요.
                    //                     - 지원자가 [경험]을 시작했던 자세한 계기를 포함해 주세요.
                    //                     - [경험]의 결과와 그 결과를 달성할 수 있었던 이유에 대한 자세한 스토리를 만들어 포함해 주세요.
                    //                     - 숫자를 통한 구체적인 수치를 사용해 주고, 모호한 단어는 구체적인 수치로 바꾸어 주세요.
                    //                     - 지원자의 주관적인 생각을 없애고, 객관적인 요소들을 사용해 주세요.
                    //                     - 감성적이고 자연스러운 느낌으로 작성해 주세요.`
                    //     }
                    // ],
                    temperature: 0.3,
                    max_tokens: 3000,
                });

                return res.status(200).json({
                    success: true,
                    type: type,
                    data: draft.data.choices[0].message.content,
                });
            case 1:
                const [ corr_position, corr_question, corr_content ] = req.body.content;

                const correction = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            "role": "system",
                            "content": `[조건]

                            - 감성적이고 자연스러운 말투로 작성해 주세요.
                            - 예시를 추가해 주세요.
                            - 자세하게 작성해 주세요.
                            - 답변은 아래와 같은 형태로 제공해 주세요.
                            - 구체적으로 언급해야 하는 부분은 예시로 적절한 스토리를 만들어 제공해 주세요.
                            
                            [자기소개서 질문], [지원하려는 직무], 그리고 글 구조와 관련해 [자기소개서 내용]의 개선 방안을 [조건]에 맞게 답변해 줘.
                            
                            [답변 예시]
                            개선 방안 1:
                            개선 방안 2:
                            개선 방안 3:`
                        },
                        {
                            "role": "user",
                            "content": `

                            [지원하려는 직무]
                            ${corr_position}
                            [자기소개서 질문] 
                            ${corr_question}

                            [자기소개서 내용]
                            ${corr_content}`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 3000,
                });

                return res.status(200).json({
                    success: true,
                    type: type,
                    data: correction.data.choices[0].message.content,
                });
            case 2:
                const [ leg_content ] = req.body.content;

                const legible = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            "role": "system",
                            "content": `[자기소개서 내용]에 대해 문장 가독성의 향상이 필요한 문장을 [예시] 형태에 맞춰 작성해 줘.
                                        [예시]
                                        <기존 자기소개서 문장 -1>
                                        <개선된 자기소개서 문장 -1>
                                        
                                        <기존 자기소개서 문장 -2>
                                        <개선된 자기소개서 문장 -2>
                                        
                                        <기존 자기소개서 문장 -3>
                                        <개선된 자기소개서 문장 -3>`
                        },
                        {
                            "role": "user",
                            "content": `
                                        [자기소개서 내용]
                                        ${leg_content}`
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 3000,
                });

                return res.status(200).json({
                    success: true,
                    type: type,
                    data: legible.data.choices[0].message.content,
                });
            case 3:
                const [ q_generator_content ] = req.body.content;

                const q_generator = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            "role": "system",
                            "content": `너는 면접관 '요즘자소서'야.
                                        [자기소개서 내용] 기반이지만 [자기소개서]에 없는 내용을 물어보는 형태로 [예시] 형태에 맞춰 작성해 줘. 답변은 작성하지 말아줘.
                                        [예시]
                                        예상질문 1:
                                        예상질문 2:
                                        예상질문 3:
                                        예상질문 4:
                                        예상질문 5:`
                        },
                        {
                            "role": "user",
                            "content": `
                                        [자기소개서 내용]
                                        ${q_generator_content}`
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 3000,
                });

                return res.status(200).json({
                    success: true,
                    type: type,
                    data: q_generator.data.choices[0].message.content,
                });
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.response
                ? error.response.data
                : "There was an issue on the server",
        });
    }
});

exports.api = functions
            .runWith({
                timeoutSeconds: 300,
            })                
            .https
            .onRequest(app);