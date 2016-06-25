//=============================================================================
// CustomizeErrorScreen.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.1 2016/06/25 エラー発生時のリンク先を別画面で開くよう修正
// 1.0.0 2016/05/14 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc Customize Error Screen
 * @author triacontane
 *
 * @param MainMessage
 * @desc
 * @default !!Error!!
 *
 * @param HyperLink
 * @desc
 * @default
 *
 * @param OutputDetail
 * @desc
 * @default ON
 *
 * @help Visualize detail information for Error Screen.
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc エラー画面表示改善プラグイン
 * @author トリアコンタン
 *
 * @param メインメッセージ
 * @desc エラー画面に共通で表示されるメッセージ
 * @default 以下のエラーが発生しました。
 *
 * @param ハイパーリンク
 * @desc エラー画面に表示するリンク先URL
 * @default
 * 
 * @param 詳細情報出力
 * @desc エラー情報の詳細(スタックトレース)を出力します。
 * @default ON
 *
 * @help エラー画面の表示を改善します。固定メッセージと連絡先のハイパーリンクを
 * 指定できるほか、エラーの詳細情報（スタックトレース）も表示されるようになります。
 * またURL用にエンコードされて表示される全角文字列をもとの文字列に
 * デコードして表示します。
 *
 * このプラグインにはプラグインコマンドはありません。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function () {
    'use strict';
    var pluginName = 'CustomizeErrorScreen';

    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value === null ? '' : value;
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON';
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramMainMessage  = getParamString(['MainMessage', 'メインメッセージ']);
    var paramHyperLink    = getParamString(['HyperLink', 'ハイパーリンク']);
    var paramOutputDetail = getParamBoolean(['OutputDetail', '詳細情報出力']);

    //=============================================================================
    // SceneManager
    //  エラー情報の出力処理を追加します。
    //=============================================================================
    var _SceneManager_onError = SceneManager.onError;
    SceneManager.onError = function(e) {
        _SceneManager_onError.apply(this, arguments);
        try {
            Graphics.printErrorDetail(e, decodeURIComponent(e.filename));
        } catch (e2) {
        }
    };

    var _SceneManager_catchException = SceneManager.catchException;
    SceneManager.catchException = function(e) {
        _SceneManager_catchException.apply(this, arguments);
        Graphics.printErrorDetail(e);
    };

    //=============================================================================
    // Graphics
    //  エラー情報を出力します。
    //=============================================================================
    var _Graphics__makeErrorHtml = Graphics._makeErrorHtml;
    Graphics._makeErrorHtml = function(name, message) {
        arguments[1] = decodeURI(message);
        return _Graphics__makeErrorHtml.apply(this, arguments);
    };

    Graphics.printErrorDetail = function(e) {
        this.hideFps();
        this._setErrorPrinterStyle();
        if (this._errorPrinter) {
            this._makeMainMessage();
            if (paramHyperLink)    this._makeHyperLink();
            if (paramOutputDetail) this._makeStackTrace(e.stack || e);
        }
    };

    Graphics._makeMainMessage = function() {
        var mainMessage = document.createElement('div');
        var style = mainMessage.style;
        style.color            = 'white';
        style.textAlign        = 'left';
        style.fontSize         = '18px';
        mainMessage.innerHTML = '<hr>' + paramMainMessage;
        this._errorPrinter.appendChild(mainMessage);
    };

    Graphics._makeHyperLink = function() {
        var hyperLink = document.createElement('div');
        var style = hyperLink.style;
        style.color            = 'white';
        style.textAlign        = 'left';
        style.fontSize         = '18px';
        hyperLink.innerHTML = '<a href="' + paramHyperLink + '" target="_blank">' + paramHyperLink + '</a>';
        this._errorPrinter.appendChild(hyperLink);
    };

    Graphics._makeStackTrace = function(stack) {
        var stackTrace = document.createElement('div');
        var style = stackTrace.style;
        style.color            = 'white';
        style.textAlign        = 'left';
        style.fontSize         = '18px';
        style.userSelect       = 'text';
        style.webkitUserSelect = 'text';
        style.msUserSelect     = 'text';
        style.mozUserSelect    = 'text';
        stackTrace.innerHTML = '<br><hr>' + stack + '<hr>';
        this._errorPrinter.appendChild(stackTrace);
    };

    Graphics._setErrorPrinterStyle = function() {
        this._errorPrinter.width = this._width * 0.9;
        this._errorPrinter.height = this._height * 0.9;
        var style = this._errorPrinter.style;
        style.textAlign = 'center';
        style.textShadow = '1px 1px 3px #000';
        style.fontSize = '22px';
        style.zIndex = 99;
        this._centerElement(this._errorPrinter);
    };
})();

