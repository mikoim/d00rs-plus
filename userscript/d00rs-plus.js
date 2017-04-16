// ==UserScript==
// @name         D00RS Plus
// @namespace    https://github.com/mikoim/d00rs-plus
// @version      0.1.0
// @description  Enhances the DOORS(Doshisha University Library) Experience
// @author       Eshin Kunishima
// @require      https://unpkg.com/vue
// @match        http://localhost:8989/test.html
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function injectSearchForm() {
        let html = `
<h3><span>Search books on NDL</span></h3>
<dl class="srv_dl_list bok_req_form_dl_list bok_select">

<dt class="bokreq_tr">Keyword</dt>
<dd class="bokreq_tr">
    <input type="text" v-model="keyword" v-on:keyup.enter="search" class="textbox_tr" placeholder="Title, ISBN, Creator, Publisher, etc... Press enter key to search.">
    <span class="colRed bok_lbl_msg" id="tr_s_error"></span>
</dd>

<dt class="bokreq_tr">Result</dt>
<dd class="bokreq_tr">
    <select v-model="selected">
        <option v-for="book in books" v-bind:value="book.link">"{{ book.title }}", {{ book.author }}</option>
    </select>
    <span class="colRed bok_lbl_msg" id="tr_s_error"></span>
</dd>

<dt class="bokreq_tr">Status</dt>
<dd class="bokreq_tr">{{ status }}</dd>

</dl>
`;

        let form = document.createElement('div');
        form.id = 'ndl_search';
        form.innerHTML = html;

        document.querySelector('#srv_bok_form').prepend(form);
    }

    function reduceByKey(value, key) {
        if (Array.isArray(value)) {
            return value.reduce(function (prev, cur, index, array) {
                return prev + cur[key] + ', ';
            }, '');
        } else {
            return value[key];
        }
    }

    function fillForm(selector, value) {
        document.querySelector(selector).value = value != null ? value : '';
    }

    function fillRequestForm(data) {
        fillForm('#tr', reduceByKey(data.title, 'value'));
        fillForm('#al', reduceByKey(data.creator, 'name'));
        fillForm('#pub', reduceByKey(data.publisher, 'name'));
        fillForm('#pyear', data.issued);
        fillForm('#isbn', data.identifier.ISBN);
        fillForm('#planpri', data.price.replace(/(円|\+税)/, ''));
    }

    injectSearchForm();

    let app = new Vue({
        el: '#ndl_search',
        data: {
            keyword: '',
            books: [],
            selected: null,
            status: '',
        },
        watch: {
            'selected': function (value) {
                let xhr = new XMLHttpRequest();
                let self = this;
                let uri = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%20%3D%20'${encodeURI(value + '.json')}'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`;
                xhr.open('GET', uri);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    }

                    switch (xhr.readyState) {
                        case XMLHttpRequest.UNSENT:
                            break;
                        case XMLHttpRequest.OPENED:
                        case XMLHttpRequest.HEADERS_RECEIVED:
                        case XMLHttpRequest.LOADING:
                            self.status = 'Loading...';
                            break;
                        case XMLHttpRequest.DONE:
                            if (xhr.status === 200) {
                                fillRequestForm(JSON.parse(xhr.responseText).query.results.json);
                                self.status = 'Done';
                            } else {
                                self.status = xhr.statusText;
                            }
                            break;
                    }
                };
                xhr.send();
            }
        },
        methods: {
            search: function (event) {
                let xhr = new XMLHttpRequest();
                let self = this;
                let uri = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20'http%3A%2F%2Fiss.ndl.go.jp%2Fapi%2Fopensearch%3Fcnt%3D10%26mediatype%3D1%26any%3D${encodeURI(encodeURI(this.keyword))}'&format=json`;
                xhr.open('GET', uri);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    }

                    switch (xhr.readyState) {
                        case XMLHttpRequest.UNSENT:
                            break;
                        case XMLHttpRequest.OPENED:
                        case XMLHttpRequest.HEADERS_RECEIVED:
                        case XMLHttpRequest.LOADING:
                            self.status = 'Loading...';
                            break;
                        case XMLHttpRequest.DONE:
                            if (xhr.status === 200) {
                                self.books = JSON.parse(xhr.responseText).query.results.rss.channel.item.map(function (obj) {
                                    return {
                                        title: obj.title[0],
                                        author: obj.author,
                                        publisher: obj.publisher,
                                        link: obj.link
                                    };
                                });
                                self.status = 'Done';
                            } else {
                                self.status = xhr.statusText;
                            }
                            break;
                    }
                };
                xhr.send();
            }
        },
    });

})();
