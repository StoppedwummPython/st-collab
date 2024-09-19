/*
Copyright 2024 Stoppedwumm

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const url = document.location.href
let _
let query
if (url.split("?").length == 1) {
    query = {}
} else {
    _ = url.split("?")[1]
    _ = _.split("&")
    query = {}
    _.forEach((q) => {
        let _0 = q.split("=")
        query[_0[0]] = _0[1]
    })
}
