package cz.honzapoko.klicek;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Most mezi webem a widgetem: web sem pošle dnešní stav, plugin ho uloží a překreslí widget. */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    public static final String PREFS = "klicek_widget";

    @PluginMethod
    public void update(PluginCall call) {
        String json = call.getString("json", "{}");
        Context ctx = getContext();
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        sp.edit().putString("state", json).putLong("ts", System.currentTimeMillis()).apply();
        KlicekWidget.refreshAll(ctx);
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }

    /** Vydá a vyprázdní frontu odškrtnutí z widgetu (appka je zapíše do záznamů). */
    @PluginMethod
    public void takePending(PluginCall call) {
        Context ctx = getContext();
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String pending = sp.getString("pending", "[]");
        sp.edit().putString("pending", "[]").apply();
        JSObject ret = new JSObject();
        ret.put("json", pending);
        call.resolve(ret);
    }
}
