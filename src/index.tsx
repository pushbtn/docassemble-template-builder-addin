import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ES6Promise from "es6-promise";
ES6Promise.polyfill();

import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton, ActionButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { IComboBox } from 'office-ui-fabric-react/lib/components/ComboBox/ComboBox.types';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
initializeIcons();

declare var Cookies: any;
declare var window: any;
declare module JSX {
    interface IntrinsicElements {
        "AddinApp": AddinApp
    }
}

class AddinApp extends React.Component<any, any> {
    constructor(props: {}) {
        super(props);
        var serverName = Cookies.get('serverName');
        this.state = {
            showServerName: serverName ? false : true,
            showServerNameError: false,
            frameStage: serverName ? "wait" : "standby",
            serverName: serverName,
            tempServerName: "",
            showApp: false,
            interviewList: [],
            interviewOptions: [],
            currentInterview: null,
            varList: [],
            vocabList: [],
            varOptions: [],
            selectedVar: null,
            findReplace: false,
            applyFormat: "",
            selectedExpression: null,
            listOptions: [],
            selectedList: null,
            childTemplateList: [],
            selectedChildTemplate: null,
            childTemplateVariables: null,
            uploadMessage: null,
            inUploadProcess: false
        }
        // All methods need to be initialized like this.
        this.receiveMessage = this.receiveMessage.bind(this);
        this.handleServerNameChange = this.handleServerNameChange.bind(this);
        this.handleSetServer = this.handleSetServer.bind(this);
        this.fetchVars = this.fetchVars.bind(this);
        this.fetchFiles = this.fetchFiles.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.handleInterviewChange = this.handleInterviewChange.bind(this);
        this.handleVarChanged = this.handleVarChanged.bind(this);
        this.handleFindReplaceChange = this.handleFindReplaceChange.bind(this);
        this.handleApplyFormatChanged = this.handleApplyFormatChanged.bind(this);
        this.insertVariable = this.insertVariable.bind(this);
        this.handleExpressionChanged = this.handleExpressionChanged.bind(this);
        this.ifPara = this.ifPara.bind(this);
        this.ifInline = this.ifInline.bind(this);
        this.handleListChanged = this.handleListChanged.bind(this);
        this.handleDisplayOnlyCheckedItems = this.handleDisplayOnlyCheckedItems.bind(this);
        this.listPara = this.listPara.bind(this);
        this.handleChildTemplateChanged = this.handleChildTemplateChanged.bind(this);
        this.handleChildTemplateVariablesChanged = this.handleChildTemplateVariablesChanged.bind(this);
        this.insertTemplate = this.insertTemplate.bind(this);
        this.commentPara = this.commentPara.bind(this);
        this.changeServer = this.changeServer.bind(this);
        this.hideUploadMessage = this.hideUploadMessage.bind(this);
        this.showUploadFail = this.showUploadFail.bind(this);
        this.cleanupSmartQuotes = this.cleanupSmartQuotes.bind(this);
    }

    render() {
        return (
            <div>
                <div className={this.state.showServerName ? 'shownelement' : 'hiddenelement'}>
                    <TextField
                        label='Your docassemble server'
                        onChanged={this.handleServerNameChange}
                    />
                    <div className={this.state.showServerNameError ? 'errormessage' : 'hiddenelement'}>
                        Please enter a valid URL.
                    </div>
                    <DefaultButton
                        text='Connect to server'
                        onClick={this.handleSetServer}
                    />
                </div>
                <iframe id="server" src={this.state.serverName ? this.state.serverName + '/officeaddin' : 'static/html/blank.html'} className={this.state.frameStage == "wait" ? 'shownelement' : 'hiddenelement'} />
                <main id="app-body" className={this.state.showApp ? 'ms-welcome__main' : 'hiddenelement'}>
                    <DefaultButton
                        iconProps={{ iconName: 'CloudUpload' }}
                        onClick={this.uploadFile}
                        text="Upload template to Playground"
                    />
                    <div className={this.state.uploadMessage != null ? 'shownelement' : 'hiddenelement'}>
                        {this.state.uploadMessage}
                    </div>
                    <Dropdown
                        label='Interview'
                        onChanged={this.handleInterviewChange}
                        options={this.state.interviewOptions}

                    />
                    <h2 className="ms-font-xl">Insert Variables</h2>
                    <ComboBox
                        label="Variable Name"
                        allowFreeform={true}
                        autoComplete='on'
                        onChanged={this.handleVarChanged}
                        options={this.state.varOptions}
                    />
                    <Checkbox
                        label="Find and Replace All"
                        onChange={this.handleFindReplaceChange}
                    />
                    <Dropdown
                        label="Apply Format"
                        onChanged={this.handleApplyFormatChanged}
                        options={this.applyFormatOptions}
                        defaultSelectedKey=""
                    />
                    <DefaultButton
                        iconProps={{ iconName: 'CirclePlus' }}
                        onClick={this.insertVariable}
                        text="Insert Variable"
                    />
                    <h2 className="ms-font-xl">Branch Logic</h2>
                    <ComboBox
                        label="Expression or Variable Name"
                        allowFreeform={true}
                        autoComplete='on'
                        onChanged={this.handleExpressionChanged}
                        options={this.state.varOptions}
                    />
                    <DefaultButton
                        onClick={this.ifPara}
                        text="If (Paragraph)"
                        primary={true}
                    />
                    <DefaultButton
                        onClick={this.ifInline}
                        text="If (Inline)"
                        primary={true}
                    />
                    <h2 className="ms-font-xl">Insert List</h2>
                    <ComboBox
                        label="List Variable Name"
                        allowFreeform={true}
                        autoComplete='on'
                        onChanged={this.handleListChanged}
                        options={this.state.listOptions}
                    />
                    <Checkbox
                        label="Display only checked items"
                        onChange={this.handleDisplayOnlyCheckedItems}
                    />
                    <DefaultButton
                        onClick={this.listPara}
                        text="Add List"
                        primary={true}
                    />
                    <h2 className="ms-font-xl">Insert a child template</h2>
                    <ComboBox
                        label="Child template name"
                        allowFreeform={true}
                        autoComplete='on'
                        onChanged={this.handleChildTemplateChanged}
                        options={this.state.childTemplateList}
                    />
                    <TextField
                        label='Set child template variables'
                        onChanged={this.handleChildTemplateVariablesChanged}
                    />
                    <DefaultButton
                        onClick={this.insertTemplate}
                        text="Insert template"
                        primary={true}
                    />
                    <h2 className="ms-font-xl">Comment</h2>
                    <DefaultButton
                        onClick={this.commentPara}
                        text="Toggle Comments"
                        primary={true}
                    />
                    <h2 className="ms-font-xl">Cleanup quotes</h2>
                    <DefaultButton
                        onClick={this.cleanupSmartQuotes}
                        text="Cleanup smart quotes"
                        primary={true}
                    />
                </main>
                <div id="app-body" className={this.state.serverName != null ? 'ms-welcome__main' : 'hiddenelement'}>
                    <DefaultButton
                        iconProps={{ iconName: 'Cloud' }}
                        onClick={this.changeServer}
                        text="Use another server"
                    />
                </div>
            </div>);
    }

    ////////////////////////////////////////////////////////////////
    // Docassemble code actions
    insertVariable() {
        console.log("insertVariable");
        window.Word.run(async (context: any) => {
            console.log("insertVariable inside");
            var variableName = this.state.selectedVar;
            var variableReplaceAll = this.state.findReplace;
            var variableFormat = this.state.applyFormat;

            if (variableName == null) {
                return;
            }

            const range = context.document.getSelection();

            var textToInsert: string;
            if (variableFormat == "") {
                textToInsert = variableName;
            } else {
                textToInsert = variableFormat + '(' + variableName + ')';
            }

            range.load('text');

            if (!variableReplaceAll) {
                range.insertText('{{ ' + variableName + ' }}', 'Replace');
            } else {
                console.log('Replacing in range');
                await context.sync();
                var textToReplace = range.text.trim();

                // FIXME: We need to ignore Jinja statements and expressions -- search looks inside them now
                await replaceInRange(context, context.document.body, textToReplace, '{{ ' + textToInsert + ' }}', {matchWholeWord: true});
                
            }

            await context.sync();
        });
    }

    ifPara() {
        console.log("ifPara");
        window.Word.run(async (context: any) => {
            console.log("ifPara inside");
            var ifExpression = this.state.selectedExpression;

            if (ifExpression == null) {
                return;
            }

            const range = context.document.getSelection();

            // Read the range text
            range.load('text');
            var textBefore = '{%p if ' + ifExpression + ' %}';

            range.insertParagraph(textBefore, 'Before');
            range.insertParagraph('{%p endif %}', 'After');

            await context.sync();
            console.log(`The selected text was ${range.text}.`);
        });
    }

    ifInline() {
        console.log("ifInline");
        window.Word.run(async (context: any) => {
            console.log("ifInline inside");
            var ifExpression = this.state.selectedExpression;

            if (ifExpression == null) {
                return;
            }

            var textBefore = '{% if ' + ifExpression + ' %}';

            const range = context.document.getSelection();

            // Read the range text
            range.load('text');

            range.insertText(textBefore, 'Before');
            range.insertText('{% endif %}', 'After');

            await context.sync();
            console.log(`The selected text was ${range.text}.`);
        });
    }

    listPara() {
        console.log("listPara");
        window.Word.run(async (context: any) => {
            console.log("listPara inside");
            var listVariableName = this.state.selectedList;

            if (listVariableName == null) {
                return;
            }

            const range = context.document.getSelection();

            var onlyTrue = this.state.displayOnlyCheckedItems;
            if (onlyTrue) {
                var textBefore = '{%p for item in ' + listVariableName + '.true_values() %}';
            } else {
                var textBefore = '{%p for item in ' + listVariableName + '%}';
            }
            // Read the range text
            range.load('text');
            range.insertText('{{ item }}', 'Replace');
            range.insertParagraph(textBefore, 'Before');
            range.insertParagraph('{%p endfor %}', 'After');

            await context.sync();
            console.log(`The selected text was ${range.text}.`);
        });
    }

    commentPara() {
        console.log("commentPara");
        window.Word.run(async (context: any) => {
            console.log("commentPara inside");
            const range = context.document.getSelection();

            // Read the range text
            range.load('text');
            await context.sync(); // Guess this has a performance penalty?

            // Regexp with 3 groups: {# , text between comments, #}. We match both whitespace and non-whitespace, including newlines
            var re = new RegExp('({#)([\\s\\S]*)(#})');

            if (re.test(range.text)) { // index 1 is the uncommented string
                await context.sync();
                var textToReplace = '{#';
                var results = range.search('{#');
                context.load(results);

                await context.sync();

                for (var i = 0; i < results.items.length; i++) {
                    results.items[i].insertText('', "Replace");
                }

                var results = range.search('#}');
                context.load(results);

                await context.sync();

                for (var i = 0; i < results.items.length; i++) {
                    results.items[i].insertText('', "Replace");
                }

                console.log('Removed comments.')
            } else {
                range.insertParagraph('{#', 'Before');
                range.insertParagraph('#}', 'After');
                range.expandTo(range.paragraphs.getFirst().getPrevious().getRange());
                range.expandTo(range.paragraphs.getLast().getNext().getRange());

                console.log('Added comments.')
                // we should extend the selection to include the newly added text
            }
            await context.sync();
        });
    }

    cleanupSmartQuotes() {
        console.log("cleanupSmartQuotes");
        window.Word.run(async (context: any) => {
            
            const range = context.document.getSelection();
            const patternVars = "\\{\\{*\\}\\}";
            const patternStatements = "\\{%*%\\}";
            const searchOptions = { matchWildcards: true };

            var results = context.document.body.search(patternVars, searchOptions);

            context.load(results);
            await context.sync();

            for (var i = 0; i < results.items.length; i++) {
                await replaceInRange(context, results.items[i], "\u201C",'"',{});
                await replaceInRange(context, results.items[i], "\u201D",'"',{});
                await replaceInRange(context, results.items[i], "\u2018","'",{});
                await replaceInRange(context, results.items[i], "\u2019","'",{});                
            }

            results = context.document.body.search(patternStatements, searchOptions);

            context.load(results);
            await context.sync();

            for (var i = 0; i < results.items.length; i++) {
                await replaceInRange(context, results.items[i], "\u201C",'"',{});
                await replaceInRange(context, results.items[i], "\u201D",'"',{});
                await replaceInRange(context, results.items[i], "\u2018","'",{});
                await replaceInRange(context, results.items[i], "\u2019","'",{});              }

            await context.sync();
        });
    }

    insertTemplate() {
        console.log("insertTemplate");
        window.Word.run(async (context: any) => {
            console.log("insertTemplate inside");
            var templateName = this.state.selectedChildTemplate;
            var templateOptions = this.state.childTemplateVariables;

            if (templateName == null) {
                return;
            }

            const range = context.document.getSelection();
            if (templateOptions == "") {
                var textBefore = '{{ include_docx_template("' + templateName + '") }}';
            } else {
                var textBefore = '{{ include_docx_template("' + templateName + '", ' + templateOptions + ') }}';
            }

            // Read the range text
            range.load('text');

            range.insertText(textBefore, 'Replace');

            await context.sync();
            console.log(`The selected text was ${range.text}.`);
        });
    }

    handleVarChanged = (option: IComboBoxOption, index: number, value: string): void => {
        console.log('handleVarChanged() is called: option = ' + JSON.stringify(option));
        if (option !== undefined) {
            this.setState({
                selectedVar: option.key
            });
        } else if (index !== undefined && index >= 0 && index < this.state.varOptions.length) {
            this.setState({
                selectedVar: this.state.varOptions[index].key
            });
        } else if (value !== undefined) {
            const newOption: IComboBoxOption = { key: value, text: value };
            this.setState({
                varOptions: [...this.state.varOptions, newOption],
                selectedVar: newOption.key
            });
        }
    }

    handleExpressionChanged = (option: IComboBoxOption, index: number, value: string): void => {
        console.log('handleExpressionChanged() is called: option = ' + JSON.stringify(option));
        if (option !== undefined) {
            this.setState({
                selectedExpression: option.key
            });
        } else if (index !== undefined && index >= 0 && index < this.state.varOptions.length) {
            this.setState({
                selectedExpression: this.state.varOptions[index].key
            });
        } else if (value !== undefined) {
            this.setState({
                selectedExpression: value
            });
        }
    }

    handleListChanged = (option: IComboBoxOption, index: number, value: string): void => {
        console.log('handleListChanged() is called: option = ' + JSON.stringify(option));
        if (option !== undefined) {
            this.setState({
                selectedList: option.key
            });
        } else if (index !== undefined && index >= 0 && index < this.state.listOptions.length) {
            this.setState({
                selectedList: this.state.listOptions[index].key
            });
        } else if (value !== undefined) {
            const newOption: IComboBoxOption = { key: value, text: value };
            this.setState({
                ListOptions: [...this.state.listOptions, newOption],
                selectedList: newOption.key
            });
        }
    }

    handleChildTemplateChanged = (option: IComboBoxOption, index: number, value: string): void => {
        console.log('handleChildTemplateChanged() is called: option = ' + JSON.stringify(option));
        if (option !== undefined) {
            this.setState({
                selectedChildTemplate: option.key
            });
        } else if (index !== undefined && index >= 0 && index < this.state.childTemplateList.length) {
            this.setState({
                selectedChildTemplate: this.state.childTemplateList[index].key
            });
        } else if (value !== undefined) {
            const newOption: IComboBoxOption = { key: value, text: value };
            this.setState({
                ListOptions: [...this.state.childTemplateList, newOption],
                selectedChildTemplate: newOption.key
            });
        }
    }

    handleInterviewChange(newoption: any) {
        console.log("handleInterviewChange");
        if (newoption.key) {
            this.setState({ currentInterview: newoption.key });
            this.fetchVars(newoption.key);
        }
        else {
            console.log("handleInterviewChange: no new option");
        }
    }

    handleDisplayOnlyCheckedItems(ev: React.FormEvent<HTMLElement>, isChecked: boolean): void {
        this.setState({ displayOnlyCheckedItems: isChecked });
    }

    handleChildTemplateVariablesChanged(newvalue: any) {
        this.setState({ childTemplateVariables: newvalue });
    }

    handleFindReplaceChange(ev: React.FormEvent<HTMLElement>, isChecked: boolean): void {
        this.setState({ findReplace: isChecked });
    }

    private applyFormatOptions =
        [
            { key: "", text: "(none)" },
            { key: "currency", text: "Currency (localized)" },
            { key: "capitalize", text: "Capitalize" },
            { key: "indefinite_article", text: "Indefinite Article" },
            { key: "nice_number", text: "Nice Number" },
            { key: "noun_plural", text: "Pluralize noun" },
            { key: "noun_singular", text: "Singularize noun" },
            { key: "ordinal_number", text: "Ordinal Number" },
            { key: "title_case", text: "Title Case" },
            { key: "verb_past", text: "Past tense verb" },
            { key: "verb_present", text: "Present tense verb" },
            { key: "fix_punctuation", text: "Fix punctuation" },
        ];

    handleApplyFormatChanged(newoption: any) {
        this.setState({ applyFormat: newoption.key });
    }

    ////////////////////////////////////////////////////////////////
    // Core methods

    changeServer() {
        Cookies.remove('serverName');
        window.location.reload(false);
    }

    uploadFile() {
        this.setState({ uploadMessage: "Collecting file...", inUploadProcess: true });
        var oThis = this;
        setTimeout(function () {
            oThis.showUploadFail()
        }, 10000);
        var server: any = document.getElementById('server');
        window.Office.context.document.getFilePropertiesAsync(function (asyncResult: any) {
            var fileName = asyncResult.value.url;
            console.log("the raw fileName is " + fileName);
            fileName = fileName.replace(/.*[\/\\]/, '');
            fileName = fileName.replace(/\.docx\.docx/, '.docx');
            console.log("the fileName is " + fileName);
            var yamlFile = oThis.state.currentInterview;
            if (yamlFile == null) {
                yamlFile = '';
            }
            var action = Object();
            action.action = "uploadFile";
            action.yamlFile = yamlFile;
            action.fileName = fileName;
            var theServerName = oThis.state.serverName;
            getDocumentAsCompressed(function (docdataSlices: any) {
                console.log("in callback func");
                var docdata: any = [];
                for (var i = 0; i < docdataSlices.length; i++) {
                    docdata = docdata.concat(docdataSlices[i]);
                }

                var fileContent: any = new String();
                for (var j = 0; j < docdata.length; j++) {
                    fileContent += String.fromCharCode(docdata[j]);
                }
                action.content = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' + btoa(fileContent);
                oThis.setState({ uploadMessage: "Uploading file..." });
                server.contentWindow.postMessage(action, theServerName);
            });
        });
    }

    fetchVars(yamlFile: string): void {
        if (yamlFile == null) {
            console.log("fetchVars: yamlFile was null");
            return;
        }
        var server: any = document.getElementById('server');
        var action = Object();
        action.action = "fetchVars";
        action.file = yamlFile;
        server.contentWindow.postMessage(action, this.state.serverName);
    }

    fetchFiles() {
        var server: any = document.getElementById('server');
        var action = Object();
        action.action = "fetchFiles";
        server.contentWindow.postMessage(action, this.state.serverName);
    }

    handleServerNameChange(newvalue: any) {
        this.setState({ tempServerName: newvalue });
    }

    handleSetServer(event: any) {
        console.log("handleSetServer");
        if (!validateUrl(this.state.tempServerName)) {
            this.setState({ showServerNameError: true });
            return;
        }
        else {
            this.setState({ showServerNameError: false });
        }
        Cookies.set('serverName', this.state.tempServerName, { expires: 999999 });
        this.setState({ frameStage: 'wait', showServerName: false, serverName: this.state.tempServerName });
    }

    receiveMessage(event: any) {
        console.log("receiveMessage");
        //console.log("receiveMessage " + JSON.stringify(event.data));
        if (!this.state) {
            return;
        }
        if (event.origin !== this.state.serverName) {
            console.log("Message received from improper origin " + event.origin);
            return;
        }
        console.log("Received action " + event.data.action);
        if (event.data.action == 'initialize') {
            this.setState({ showApp: true, frameStage: 'loaded' });
            this.fetchFiles();
        }
        if (event.data.action == 'files') {
            var arr = Array();
            var n = event.data.files.length;
            for (var i = 0; i < n; i++) {
                arr.push({ key: event.data.files[i], text: event.data.files[i] });
            }
            this.setState({ interviewList: event.data.files, interviewOptions: arr });
        }
        if (event.data.action == 'vars') {
            var arr = Array();
            var arrList = Array();
            var n = event.data.vars.undefined_names.length;
            for (var i = 0; i < n; ++i) {
                var variable_name = event.data.vars.undefined_names[i];
                var newOption: IComboBoxOption = { key: variable_name, text: variable_name }
                arr.push(newOption);
            }
            var n = event.data.vars.var_list.length;
            for (var i = 0; i < n; ++i) {
                var info = event.data.vars.var_list[i];
                if (!info.hide) {
                    var newOption: IComboBoxOption = { key: info.var, text: info.var }
                    arr.push(newOption);
                    if (!info.hasOwnProperty('iterable') || info.iterable) {
                        arrList.push(newOption);
                    }
                }
            }
            arr.sort(function (a, b) {
                if (a.text < b.text) return -1;
                if (a.text > b.text) return 1;
                return 0;
            });
            var arrChildTemplates = Array();
            var n = event.data.vars.templates_list.length;
            for (var i = 0; i < n; ++i) {
                var info = event.data.vars.templates_list[i];
                if (/\.docx$/i.test(info.var)) {
                    var newOption: IComboBoxOption = { key: info.var, text: info.var }
                    arrChildTemplates.push(newOption);
                }
            }
            //console.log("varOptions is " + arr.length + " elements long from " + n);
            //console.log("varOptions is " + JSON.stringify(arr));
            if (event.data.hasOwnProperty('uploaded')) {
                this.setState({ uploadMessage: "Upload successful" });
                this.hideUploadMessage();
            }
            this.setState({ varOptions: arr, listOptions: arrList, varList: event.data.vars, vocabList: event.data.vocab, childTemplateList: arrChildTemplates });
            this.fetchFiles();
        }
        if (event.data.action == 'fail') {
            if (event.data.tried == 'uploadFile') {
                this.showUploadFail();
            }
        }
    }

    hideUploadMessage() {
        this.setState({ inUploadProcess: false });
        var oThis = this;
        setTimeout(function () {
            oThis.setState({ uploadMessage: null });
        }, 3000);
    }

    showUploadFail() {
        if (this.state.inUploadProcess) {
            this.setState({ inUploadProcess: false, uploadMessage: "Upload failed." });
            this.hideUploadMessage();
        }
    }

    componentDidMount() {
        console.log("adding listener");
        window.addEventListener("message", this.receiveMessage, false);
    }

    // Example of calling a subroutine that needs to handle context -- we need await keyword
    replaceX() {
        console.log("replaceX");
        window.Word.run(async (context: any) => {
            const range = context.document.getSelection();
            var query = "X";
            var replacement = "gabagool";

            await replaceInRange(context, range, query, replacement);

            return context.sync();
        });

    }
}

/////////////////////////////////////////////////////////////////////
// Helper functions

async function replaceInRange(context: any, range: any, query: String, replacement: String, searchOptions = {}) {
    console.log('replaceInRange ' + query + ' : ' + replacement);
    var results = range.search(query, searchOptions);
    results.load('text');
    await context.sync();

    for (var i = 0; i < results.items.length; i++) {
        results.items[i].insertText(replacement, 'Replace');
    }

    return context.sync();
}

// File handling
function getDocumentAsCompressed(onGotAllSlices: any) {
    console.log("in getDocumentAsCompressed");
    window.Office.context.document.getFileAsync(window.Office.FileType.Compressed, {},
        function (result: any) {
            if (result.status == "succeeded") {
                // If the getFileAsync call succeeded, then
                // result.value will return a valid File Object.
                var myFile = result.value;
                var sliceCount = myFile.sliceCount;
                var slicesReceived = 0, gotAllSlices = true, docdataSlices: any = [];
                //app.showNotification("File size:" + myFile.size + " #Slices: " + sliceCount);

                // Get the file slices.
                getSliceAsync(myFile, 0, sliceCount, gotAllSlices, docdataSlices, slicesReceived, onGotAllSlices);
            }
            else {
                //app.showNotification("Error:", result.error.message);
            }
        });
}

function getSliceAsync(file: any, nextSlice: any, sliceCount: any, gotAllSlices: any, docdataSlices: any, slicesReceived: any, onGotAllSlices: any) {
    console.log("in getSliceAsync");
    file.getSliceAsync(nextSlice, function (sliceResult: any) {
        if (sliceResult.status == "succeeded") {
            if (!gotAllSlices) { // Failed to get all slices, no need to continue.
                return;
            }

            // Got one slice, store it in a temporary array.
            // (Or you can do something else, such as
            // send it to a third-party server.)
            docdataSlices[sliceResult.value.index] = sliceResult.value.data;
            if (++slicesReceived == sliceCount) {
                // All slices have been received.
                file.closeAsync();
                onGotAllSlices(docdataSlices);
            }
            else {
                getSliceAsync(file, ++nextSlice, sliceCount, gotAllSlices, docdataSlices, slicesReceived, onGotAllSlices);
            }
        }
        else {
            gotAllSlices = false;
            file.closeAsync();
            //app.showNotification("getSliceAsync Error:", sliceResult.error.message);
        }
    });
}

function validateUrl(value: string) {
    return /^https?:\/\/\S/i.test(value);
}

window.Office.initialize = () => {
    ReactDOM.render(
        <AddinApp />,
        document.getElementById("app")
    );
}
