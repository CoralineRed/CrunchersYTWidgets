using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using YouTrackSharp;

namespace ProductionControlWidgetServer.HubInteraction
{
    internal class HubBearerTokenHttpClientHandler : HttpClientHandler
    {
        private readonly string _bearerToken;

        /// <summary>
        /// Creates an instance of the <see cref="HubBearerTokenHttpClientHandler" /> class.
        /// </summary>
        /// <param name="bearerToken">The bearer token to inject into HTTP request headers.</param>
        public HubBearerTokenHttpClientHandler(string bearerToken)
        {
            _bearerToken = bearerToken;
        }

        /// <inheritdoc />
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _bearerToken);

            return base.SendAsync(request, cancellationToken);
        }
    }

    public class HubConnection
    {
        private HttpClient _httpClient;
        private bool _authenticated;
        private Uri ServerUri;
        private readonly string _bearerToken;

        private readonly Action<HttpClientHandler> _configureHandler;

        private static string EnsureTrailingSlash(string url)
        {
            if (!url.EndsWith("/"))
            {
                return url + "/";
            }

            return url;
        }

        public HubConnection(string serverUrl, string bearerToken, Action<HttpClientHandler> configureHandler = null)
        {
            _bearerToken = bearerToken;
            _configureHandler = configureHandler;
            if (string.IsNullOrEmpty(serverUrl)
                || !Uri.TryCreate(EnsureTrailingSlash(serverUrl), UriKind.Absolute, out var serverUri))
            {
                throw new ArgumentException(nameof(serverUrl));
            }

            ServerUri = serverUri;
        }

        public async Task<HttpClient> GetAuthenticatedHttpClient()
        {
            // Initialize HTTP client
            if (_httpClient == null)
            {
                var handler = new HubBearerTokenHttpClientHandler(_bearerToken);

                _configureHandler?.Invoke(handler);

                _httpClient = new HttpClient(handler)
                {
                    BaseAddress = ServerUri
                };

                _httpClient.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue(Constants.HttpContentTypes.ApplicationJson));
            }

            // Authenticate?
            if (_authenticated)
            {
                return _httpClient;
            }

            var response = await _httpClient.GetAsync("rest/users/me");
            if (response.IsSuccessStatusCode)
            {
                _authenticated = true;
            }
            else
            {
                var responseString = await response.Content.ReadAsStringAsync();

                throw new UnauthorizedConnectionException(
                    "Unauthorized", response.StatusCode, responseString);
            }

            return _httpClient;
        }
    }
}