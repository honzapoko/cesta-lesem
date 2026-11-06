package cz.honzapoko.klicek;

import android.content.Context;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONObject;

/** Posouvatelný seznam karet pro widget Úkoly 3x4: ikona, název, „x z 7“ za týden, ukazatel, kulaté odškrtávátko. */
public class KlicekWidgetTasksService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) { return new Factory(getApplicationContext()); }

    static final String[] COLORS = { "#E2683C", "#9B45B5", "#4E9F55", "#3F86D6", "#D9A12E", "#23998D", "#CC4769", "#6A5FD1" };

    static class Factory implements RemoteViewsFactory {
        final Context ctx;
        JSONArray tasks = new JSONArray();
        String countFmt = "{0} z {1}";
        Factory(Context c) { ctx = c; }

        public void onCreate() { load(); }
        public void onDataSetChanged() { load(); }
        public void onDestroy() {}
        void load() {
            JSONObject o = KlicekWidget.freshState(KlicekWidget.prefs(ctx).getString("state", "{}"));
            JSONArray t = o.optJSONArray("tasks");
            tasks = t != null ? t : new JSONArray();
            countFmt = o.optString("countFmt", "{0} z {1}");
        }
        public int getCount() { return tasks.length(); }
        public RemoteViews getLoadingView() { return null; }
        public int getViewTypeCount() { return 1; }
        public long getItemId(int i) { return i; }
        public boolean hasStableIds() { return false; }

        public RemoteViews getViewAt(int i) {
            RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.widget_task_card);
            JSONObject t = tasks.optJSONObject(i);
            if (t == null) return rv;
            boolean done = t.optBoolean("done");
            int goal = Math.max(1, t.optInt("goal", 7)), wk = Math.min(goal, Math.max(0, t.optInt("wk", 0)));
            int color = Color.parseColor(COLORS[i % COLORS.length]);
            rv.setTextViewText(R.id.w_name, t.optString("t", ""));
            rv.setTextViewText(R.id.w_count, countFmt.replace("{0}", String.valueOf(wk)).replace("{1}", String.valueOf(goal)));
            rv.setProgressBar(R.id.w_prog, goal, wk, false);
            String icon = t.optString("icon", "");
            int res = icon.isEmpty() ? 0 : KlicekWidget.drawable(ctx, icon);
            if (res != 0) {
                rv.setImageViewResource(R.id.w_icon, res);
                rv.setViewVisibility(R.id.w_icon, View.VISIBLE); rv.setViewVisibility(R.id.w_emoji, View.GONE);
            } else {
                rv.setTextViewText(R.id.w_emoji, t.optString("ic", "⭐"));
                rv.setViewVisibility(R.id.w_icon, View.GONE); rv.setViewVisibility(R.id.w_emoji, View.VISIBLE);
            }
            rv.setImageViewResource(R.id.w_check, done ? R.drawable.widget_check_on : R.drawable.widget_check_off);
            if (Build.VERSION.SDK_INT >= 31) {
                // barva řádku (Android 12+): ukazatel v barvě karty (odškrtávátko netónovat – zmizela by bílá fajfka)
                rv.setColorStateList(R.id.w_prog, "setProgressTintList", ColorStateList.valueOf(color));
            }
            Intent fill = new Intent().putExtra("id", t.optString("id", ""));
            rv.setOnClickFillInIntent(R.id.w_card, fill);
            return rv;
        }
    }
}
