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

    let xhr = new XMLHttpRequest();

    function parseSearchResult(res) {
        window.hoge = res.query.results.rss.channel.item;
        return res.query.results.rss.channel.item.map(function (obj) {
            return {'title': obj.title[0], 'author': obj.author, 'publisher': obj.publisher, 'link': obj.link};
        });
    }

    function searchBooks(keyword) {
        xhr.open('GET', `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20'http%3A%2F%2Fiss.ndl.go.jp%2Fapi%2Fopensearch%3Fcnt%3D10%26mediatype%3D1%26any%3D${keyword}'&format=json`);
        xhr.send();
    }

    function createOption(name, value) {
        let option = document.createElement('option');
        option.setAttribute('value', value);
        option.innerHTML = name;
        return option;
    }

    function retrieveBookInformation(url) {
        console.log(url);
    }

    function logging(mes) {
        document.querySelector('#tr_s_error').innerText = mes;
    }

    function injectSearchForm() {
        let a = `
<h3><span>Search books on NDL</span></h3>
<dl class="srv_dl_list bok_req_form_dl_list bok_select">

<dt class="bokreq_tr">Keyword</dt>
<dd class="bokreq_tr">
<input name="tr_s" id="tr_s" maxlength="196" value="" type="text" class="textbox_tr" placeholder="Title, ISBN, Creator, Publisher, etc... Press enter key to search.">
<span class="colRed bok_lbl_msg" id="tr_s_error"></span>
</dd>

<dt class="bokreq_tr">Result</dt>
<dd class="bokreq_tr">
<select name="tr_l" id="tr_l" class="bok_prlndflg">
<option value="" label="" selected="selected"></option>
</select>
<span class="colRed bok_lbl_msg" id="tr_s_error"></span>
</dd>

</dl>
`;

        let b = document.createElement('div');
        b.id = 'ndl_search';
        b.innerHTML = a;
        b.querySelector('#tr_s').addEventListener('keypress', function (event) {
            if (event.keyCode !== 13) {
                return;
            }
            searchBooks(document.querySelector('#tr_s').value);
        });

        document.querySelector('#srv_bok_form').prepend(b);
    }

    xhr.onreadystatechange = function () {
        switch (this.readyState) {
            case 0:
                logging('uninitialized!');
                break;
            case 1:
                logging('loading...');
                break;
            case 2:
                logging('loaded.');
                break;
            case 3:
                logging('interactive... ' + this.responseText.length + ' bytes.');
                break;
            case 4:
                if (this.status == 200 || this.status == 304) {
                    logging('COMPLETE! :' + parseSearchResult(JSON.parse(this.responseText)));
                } else {
                    logging('Failed. HttpStatus: ' + xhr.statusText);
                }
                break;
        }
    };

    injectSearchForm();
})();
