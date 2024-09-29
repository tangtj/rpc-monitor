import {loadRule} from "./rule.js";
import {check} from "./check.js";

export async function rpc(path) {
    const content = loadRule(path)
    if (content === null) {
        console.error("empty rule")
        return
    }

    // 60s 检查一次
    await new Promise(async (resolve, reject) => {
        setInterval(function () {
            console.log("check rpc status")
            check(content)
        }, 1000 * 60);
    });
}