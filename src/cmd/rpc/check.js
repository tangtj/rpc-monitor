import {Web3} from "web3";
import {exec} from "child_process";
import {config} from "../../config/config.js";


/**
 *
 * @param {{
 *      rules:[
 *          {
 *              name:string,
 *              reference:[
 *                  {
 *                      name:string,
 *                      url:string
 *                  }
 *              ],
 *              target:[
 *                  {
 *                      name:string,
 *                      url:string,
 *                      maxDeviation:number,
 *                      action:string
 *                  }
 *              ],
 *          }
 *      ]
 * } | null} rules
 */
export function check(rules) {
    if (rules === false) {
        return
    }


    rules?.rules.forEach(async rule => {
        const ref = rule.reference

        let avgBlockNum = await Promise.all(ref.map(async (ref) => {
            const web3 = new Web3(ref.url)
            return web3.eth.getBlockNumber()
        })).then((blockNumbers) => {
            return blockNumbers.reduce((a, b) => a + b) / BigInt(blockNumbers.length)
        }).catch((e) => {
            console.error("访问参考 rpc 异常", e)
            return null
        })
        if (avgBlockNum === null) {
            console.error("访问参考 rpc 异常")
            return
        }

        // 请求目标 rpc
        for (const target of rule.target) {
            const web3 = new Web3(target.url)
            const blockNumber = (await web3.eth.getBlockNumber()
                .catch(e=>{
                    console.error(e)
                    return BigInt(0)
                })
            ) ?? BigInt(0);
            let diff = Number(blockNumber - avgBlockNum)
            console.log(`avg : ${blockNumber}, target: ${target.url} 高度 ${avgBlockNum} , rule: ${rule.name}#${target.name} : ${diff}`)
            if (diff > 0 && diff > target.maxDeviation) {
                console.error(`规则 ${rule.name} 不符合要求`)
                // 发送通知到 tg

                const form = new FormData();
                form.append('chat_id', config.tg.chatId)
                form.append('text', `规则 ${rule.name}#${target.name} 落后，${diff} 个块`)

                fetch(`https://api.telegram.org/${config.tg.token}/sendMessage`, {
                    method: 'POST',
                    body: form
                }).then(async (res) => {
                    console.log(await res.text())
                }).catch((e) => {
                    console.error("发送 tg 通知异常", e)
                })

                if (target?.action?.length > 0) {
                    console.error("执行 action", target.action)
                    exec(target.action, (err, stdout, stderr) => {
                        if (err) {
                            console.error(err)
                        }
                        console.log(stdout)
                    })
                }
            }
        }
    })
}