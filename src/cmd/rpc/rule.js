import jsYaml from "js-yaml";
import fs from "fs";

/**
 *
 * @param  {string} path
 * @return {{
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
 *                  }
 *              ],
 *              action:string
 *          }
 *      ]
 * } | null}
 *
 */
export function loadRule(path) {
    const content = fs.readFileSync(path, {
        encoding: "utf-8", flag: "r"
    });
    return jsYaml.load(content)
}