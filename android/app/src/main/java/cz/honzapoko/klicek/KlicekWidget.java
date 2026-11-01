package cz.honzapoko.klicek;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

/** Základ widgetu. Tři velikosti = tři podtřídy (malý 2x1, střední 4x2, velký 4x4). */
public class KlicekWidget extends AppWidgetProvider {
    protected int size() { return 1; } // 0 malý, 1 střední, 2 velký

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        String json = ctx.getSharedPreferences(WidgetBridgePlugin.PREFS, Context.MODE_PRIVATE).getString("state", "{}");
        for (int id : ids) mgr.updateAppWidget(id, build(ctx, json, size()));
    }

    /** Překreslí všechny widgety všech velikostí (volá plugin po každém uložení). */
    public static void refreshAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        String json = ctx.getSharedPreferences(WidgetBridgePlugin.PREFS, Context.MODE_PRIVATE).getString("state", "{}");
        Class<?>[] cls = { KlicekWidgetSmall.class, KlicekWidget.class, KlicekWidgetLarge.class };
        for (int s = 0; s < cls.length; s++) {
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, cls[s]));
            for (int id : ids) mgr.updateAppWidget(id, build(ctx, json, s));
        }
    }

    static String plural(int n, String a, String b, String c) { return n == 1 ? a : (n >= 2 && n <= 4 ? b : c); }

    static RemoteViews build(Context ctx, String json, int size) {
        int layout = size == 0 ? R.layout.widget_small : size == 2 ? R.layout.widget_large : R.layout.widget_klicek;
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), layout);
        int streak = 0, done = 0, total = 0, coins = 0; String lead = "Pomalu, ale jistě.", quote = "";
        JSONArray tasks = new JSONArray();
        try {
            JSONObject o = new JSONObject(json);
            streak = o.optInt("streak", 0); done = o.optInt("done", 0); total = o.optInt("total", 0); coins = o.optInt("coins", 0);
            lead = o.optString("lead", lead); quote = o.optString("quote", "");
            if (o.optJSONArray("tasks") != null) tasks = o.optJSONArray("tasks");
        } catch (Exception ignored) {}
        boolean allDone = total > 0 && done == total;
        rv.setTextViewText(R.id.w_streak, streak + " " + plural(streak, "den", "dny", "dní") + " v řadě");
        rv.setTextViewText(R.id.w_progress, total > 0 ? done + " / " + total : "–");
        if (size >= 1) {
            rv.setTextViewText(R.id.w_lead, lead);
            int[] rows = size == 2
                ? new int[]{ R.id.w_t1, R.id.w_t2, R.id.w_t3, R.id.w_t4, R.id.w_t5, R.id.w_t6, R.id.w_t7, R.id.w_t8, R.id.w_t9, R.id.w_t10 }
                : new int[]{ R.id.w_t1, R.id.w_t2, R.id.w_t3, R.id.w_t4, R.id.w_t5 };
            for (int i = 0; i < rows.length; i++) {
                if (i < tasks.length()) {
                    JSONObject t = tasks.optJSONObject(i);
                    boolean d = t != null && t.optBoolean("done");
                    rv.setViewVisibility(rows[i], View.VISIBLE);
                    rv.setTextViewText(rows[i], (d ? "✅  " : "⬜  ") + (t != null ? t.optString("t", "") : ""));
                } else rv.setViewVisibility(rows[i], View.GONE);
            }
            rv.setImageViewResource(R.id.w_sloth, allDone ? R.drawable.widget_sloth_big : R.drawable.widget_sloth);
        }
        if (size == 2) {
            rv.setTextViewText(R.id.w_coins, "🪙 " + coins);
            rv.setTextViewText(R.id.w_quote, quote);
            rv.setViewVisibility(R.id.w_quote, quote.isEmpty() ? View.GONE : View.VISIBLE);
        }
        Intent open = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (open != null) {
            PendingIntent pi = PendingIntent.getActivity(ctx, size, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            rv.setOnClickPendingIntent(R.id.w_root, pi);
        }
        return rv;
    }
}
