'use babel';

import AutoSaveOnIdleView from './auto-save-on-idle-view';
import { CompositeDisposable } from 'atom';

var lastText = "";
var charBufferToSave = 10;
var autoSaveEnabled = true;
export default {

  autoSaveOnIdleView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
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
          if (editor.getText().length > (lastText.length + charBufferToSave) || lastText.length > editor.getText().length) {
            if (autoSaveEnabled) {
              //atom.notifications.addInfo( 'document saved ' );
              lastText = editor.getText();
              editor.save();
            }
          }
        });
      });
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
