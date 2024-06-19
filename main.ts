import { App, Plugin, PluginManifest } from 'obsidian';

export default class PopoutFreezeWorkaround extends Plugin {

	constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
	}

	async onload() {
		let _syncUnpauseTimer:NodeJS.Timeout | null  = null;

		this.registerEvent(this.app.workspace.on(("window-close"),()=> {
			//@ts-ignore
			const sync = this.app.internalPlugins.getEnabledPluginById("sync");
			//if sync is not running or is paused by user not by the event handler, then do nothing
			if (
				!sync || !sync.plugin || !sync.plugin._loaded ||
				!Boolean(sync.plugin?.instance?.getRemoteVaultId()) ||
				(sync.plugin.instance.getPause() && !Boolean(_syncUnpauseTimer))
			) {
				return;
			}
			if (typeof _syncUnpauseTimer === "number") {
				clearTimeout(_syncUnpauseTimer);
				_syncUnpauseTimer = null;
			}
			sync.plugin.instance.setPause(true);
			_syncUnpauseTimer = setTimeout(()=>{
				sync.plugin.instance.setPause(false);
				_syncUnpauseTimer = null;
			},1500);
		}));
	}

	onunload() {
	}

}
