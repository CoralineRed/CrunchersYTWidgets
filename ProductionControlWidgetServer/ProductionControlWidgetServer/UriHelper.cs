namespace ProductionControlWidgetServer
{
    public static class UriHelper
    {
        public static string EnsureTrailingSlash(string url)
        {
            if (!url.EndsWith("/"))
            {
                return url + "/";
            }

            return url;
        }
    }
}