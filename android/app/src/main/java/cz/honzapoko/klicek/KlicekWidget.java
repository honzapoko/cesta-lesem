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
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Základ widgetu. Velikosti = podtřídy: 0 malý 2x1, 1 střední 4x2, 2 velký 4x4, 3 úkoly 3x4.
 * Ťuknutí na úkol (střední, velký, úkoly) ho odškrtne přímo na ploše: widget si změnu hned zobrazí
 * a uloží do fronty "pending"; appka si frontu vyzvedne při otevření (WidgetBridge.takePending).
 */
public class KlicekWidget extends AppWidgetProvider {
    public static final String ACTION_TOGGLE = "cz.honzapoko.klicek.WIDGET_TOGGLE";
    protected int size() { return 1; }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        String json = prefs(ctx).getString("state", "{}");
        for (int id : ids) mgr.updateAppWidget(id, build(ctx, json, size()));
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        if (ACTION_TOGGLE.equals(intent.getAction())) {
            String id = intent.getStringExtra("id");
            if (id != null) toggle(ctx, id);
            return;
        }
        super.onReceive(ctx, intent);
    }

    static SharedPreferences prefs(Context ctx) { return ctx.getSharedPreferences(WidgetBridgePlugin.PREFS, Context.MODE_PRIVATE); }
    static String today() { return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()); }

    /** Stav je ze včerejška (appka dnes ještě nebyla otevřená) → denní úkoly ukázat jako nesplněné. */
    static JSONObject freshState(String json) {
        try {
            JSONObject o = new JSONObject(json);
            String t = today();
            if (!t.equals(o.optString("day", t))) {
                o.put("day", t);
                JSONArray tasks = o.optJSONArray("tasks");
                int done = 0;
                if (tasks != null) for (int i = 0; i < tasks.length(); i++) {
                    JSONObject x = tasks.optJSONObject(i); if (x == null) continue;
                    if (x.optInt("w", 0) != 1) x.put("done", false);
                    if (x.optBoolean("done")) done++;
                }
                o.put("done", done);
                o.put("mood", "face");
            }
            return o;
        } catch (Exception e) { return new JSONObject(); }
    }

    /** Odškrtnutí z widgetu: přepnout v uloženém stavu, zařadit do fronty pro appku, překreslit. */
    static void toggle(Context ctx, String id) {
        SharedPreferences sp = prefs(ctx);
        try {
            JSONObject o = freshState(sp.getString("state", "{}"));
            JSONArray tasks = o.optJSONArray("tasks");
            if (tasks == null) return;
            boolean now = false; int done = 0; boolean found = false;
            for (int i = 0; i < tasks.length(); i++) {
                JSONObject x = tasks.optJSONObject(i); if (x == null) continue;
                if (id.equals(x.optString("id"))) { now = !x.optBoolean("done"); x.put("done", now); found = true; }
                if (x.optBoolean("done")) done++;
            }
            if (!found) return;
            o.put("done", done);
            int total = o.optInt("total", tasks.length());
            if (total > 0 && done >= total) o.put("mood", "cheer");
            else if (done > 0) o.put("mood", done * 2 >= total ? "thumbs" : "walk");
            JSONArray pending = new JSONArray(sp.getString("pending", "[]"));
            JSONObject p = new JSONObject();
            p.put("id", id); p.put("day", o.optString("day", today())); p.put("done", now); p.put("ts", System.currentTimeMillis());
            pending.put(p);
            sp.edit().putString("state", o.toString()).putString("pending", pending.toString()).apply();
        } catch (Exception ignored) {}
        refreshAll(ctx);
    }

    /** Překreslí všechny widgety všech velikostí (volá plugin po každém uložení). */
    public static void refreshAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        String json = prefs(ctx).getString("state", "{}");
        Class<?>[] cls = { KlicekWidgetSmall.class, KlicekWidget.class, KlicekWidgetLarge.class, KlicekWidgetTasks.class };
        for (int s = 0; s < cls.length; s++) {
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, cls[s]));
            for (int id : ids) mgr.updateAppWidget(id, build(ctx, json, s));
        }
    }

    static String plural(int n, String a, String b, String c) { return n == 1 ? a : (n >= 2 && n <= 4 ? b : c); }

    /** Obrázek parťáka podle nálady: drawable pal_<id>_<póza> (viz scripts/widget-pals.py). */
    static int palImage(Context ctx, String pal, String mood) {
        String pose;
        switch (mood == null ? "" : mood) {
            case "cheer": case "joy": pose = "cheer"; break;
            case "thumbs": pose = "thumbs"; break;
            case "walk": case "book": case "tea": pose = "walk"; break;
            case "wave": pose = "wave"; break;
            case "think": pose = "think"; break;
            case "sad": pose = "sad"; break;
            case "sleep": pose = "sleep"; break;
            default: pose = "idle";
        }
        int r = ctx.getResources().getIdentifier("pal_" + pal + "_" + pose, "drawable", ctx.getPackageName());
        if (r == 0) r = ctx.getResources().getIdentifier("pal_sloth_" + pose, "drawable", ctx.getPackageName());
        return r != 0 ? r : R.drawable.widget_sloth;
    }

    static RemoteViews build(Context ctx, String json, int size) {
        int layout = size == 0 ? R.layout.widget_small : size == 2 ? R.layout.widget_large : size == 3 ? R.layout.widget_tasks : R.layout.widget_klicek;
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), layout);
        int streak = 0, done = 0, total = 0, coins = 0; String lead = "Pomalu, ale jistě.", quote = "", pal = "sloth", mood = "face", streakTxt = null, tapHint = "";
        JSONArray tasks = new JSONArray();
        JSONObject o = freshState(json);
        streak = o.optInt("streak", 0); done = o.optInt("done", 0); total = o.optInt("total", 0); coins = o.optInt("coins", 0);
        lead = o.optString("lead", lead); quote = o.optString("quote", ""); pal = o.optString("pal", "sloth"); mood = o.optString("mood", "face");
        streakTxt = o.optString("streakTxt", ""); tapHint = o.optString("tapHint", "");
        if (o.optJSONArray("tasks") != null) tasks = o.optJSONArray("tasks");
        rv.setTextViewText(R.id.w_streak, !streakTxt.isEmpty() ? streakTxt : streak + " " + plural(streak, "den", "dny", "dní") + " v řadě");
        rv.setTextViewText(R.id.w_progress, total > 0 ? done + " / " + total : "–");
        if (size >= 1) {
            rv.setTextViewText(R.id.w_lead, lead);
            int[] rows = size == 2
                ? new int[]{ R.id.w_t1, R.id.w_t2, R.id.w_t3, R.id.w_t4, R.id.w_t5, R.id.w_t6, R.id.w_t7, R.id.w_t8, R.id.w_t9, R.id.w_t10 }
                : size == 3
                ? new int[]{ R.id.w_t1, R.id.w_t2, R.id.w_t3, R.id.w_t4, R.id.w_t5, R.id.w_t6, R.id.w_t7, R.id.w_t8 }
                : new int[]{ R.id.w_t1, R.id.w_t2, R.id.w_t3, R.id.w_t4, R.id.w_t5 };
            for (int i = 0; i < rows.length; i++) {
                if (i < tasks.length()) {
                    JSONObject t = tasks.optJSONObject(i);
                    boolean d = t != null && t.optBoolean("done");
                    rv.setViewVisibility(rows[i], View.VISIBLE);
                    rv.setTextViewText(rows[i], (d ? "✅  " : "⬜  ") + (t != null ? t.optString("t", "") : ""));
                    String tid = t != null ? t.optString("id", "") : "";
                    if (!tid.isEmpty()) {
                        Intent it = new Intent(ctx, KlicekWidget.class).setAction(ACTION_TOGGLE).putExtra("id", tid);
                        PendingIntent pi = PendingIntent.getBroadcast(ctx, 1000 + size * 100 + i, it, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                        rv.setOnClickPendingIntent(rows[i], pi);
                    }
                } else rv.setViewVisibility(rows[i], View.GONE);
            }
        }
        rv.setImageViewResource(R.id.w_sloth, palImage(ctx, pal, mood));
        if (size == 2) {
            rv.setTextViewText(R.id.w_coins, "🪙 " + coins);
            rv.setTextViewText(R.id.w_quote, quote);
            rv.setViewVisibility(R.id.w_quote, quote.isEmpty() ? View.GONE : View.VISIBLE);
        }
        if (size == 3) {
            boolean more = tasks.length() > 8;
            rv.setTextViewText(R.id.w_more, more ? "+" + (tasks.length() - 8) : tapHint);
            rv.setViewVisibility(R.id.w_more, (more || !tapHint.isEmpty()) ? View.VISIBLE : View.GONE);
        }
        Intent open = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (open != null) {
            PendingIntent pi = PendingIntent.getActivity(ctx, size, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            rv.setOnClickPendingIntent(R.id.w_root, pi);
        }
        return rv;
    }
}
