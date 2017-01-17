'use babel';

import AutoSaveOnIdleView from './auto-save-on-idle-view';
import { CompositeDisposable } from 'atom';

var lastText = "";
var charBufferToSave = 10;
var autoSaveEnabled = true;
var onTimeout = false;
var saveDelay = 1500;


export default {

  autoSaveOnIdleView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    let saveCurrentDoc = this.saveCurrentDoc;

    this.autoSaveOnIdleView = new AutoSaveOnIdleView(state.autoSaveOnIdleViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.autoSaveOnIdleView.getElement(),
      visible: false
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'auto-save-on-idle:toggle': () => this.toggle()
    }));

    atom.workspace.observeTextEditors((editor) => {
        editor.onDidStopChanging( function (){
          if (!onTimeout) {
            onTimeout = true;
            setTimeout( function () { // save on preset intervals to avoid saving on every "stop change"
                  saveCurrentDoc(editor);
            },saveDelay);
          }
        });
      });
  },

  saveCurrentDoc (editor) {

    if (editor.getPath()) {
        if (autoSaveEnabled) {
            //atom.notifications.addInfo( 'document saved ' );
            try {
              editor.save();
            }
            catch (ex){
				if (ex.message.indexOf('locked')>0) {
					atom.notifications.addInfo( 'document locked. could not save. ' );
				}
            }
            lastText = editor.getText();
            setTimeout (function () { //editor.save() triggers onDidStopChanging. this timeout prevents that.
              onTimeout = false;
            }, 300);


        }
      }

  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.autoSaveOnIdleView.destroy();
  },

  serialize() {
    return {
      autoSaveOnIdleViewState: this.autoSaveOnIdleView.serialize()
    };
  },

  toggle() {
    autoSaveEnabled = autoSaveEnabled ? false : true ;
    message = autoSaveEnabled ? "enabled" : "disabled";
    atom.notifications.addInfo( "Auto save on idle " + message);
  }
};
