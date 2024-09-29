import {program} from 'commander';
import {rpc} from "./cmd/rpc/rpc.js";

function main() {





    program
        .description('处理 comfyui 工作流 , 转化为 api workflow 格式')
        .version('0.0.1');

    program
        .command("check")
        .argument("path", "comfyui workflw json path")
        .description("根据配置检查 rpc 的可用性")
        .version('0.0.1')
        .action(rpc)

    program.parse(process.argv)

}

main();