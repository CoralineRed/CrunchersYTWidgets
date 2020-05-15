using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using ProductionControlWidgetServer.HubInteraction;
using YouTrackSharp;

namespace ProductionControlWidgetServer.OneCInteraction
{
    internal class OneCBasicTokenHttpClientHandler : HttpClientHandler
    {
        private readonly string _basicToken;

        /// <summary>
        /// Creates an instance of the <see cref="OneCBasicTokenHttpClientHandler" /> class.
        /// </summary>
        /// <param name="basicToken">The bearer token to inject into HTTP request headers.</param>
        public OneCBasicTokenHttpClientHandler(string basicToken)
        {
            _basicToken = basicToken;
        }

        /// <inheritdoc />
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", _basicToken);

            return base.SendAsync(request, cancellationToken);
        }
    }

    public class OneCConnection
    {
        private HttpClient _httpClient;

        private readonly Uri _serverUri;
        private readonly string _basicToken;

        private readonly Action<HttpClientHandler> _configureHandler;

        public OneCConnection(string serverUrl, string basicToken, Action<HttpClientHandler> configureHandler = null)
        {
            _basicToken = basicToken;
            _configureHandler = configureHandler;

            if (string.IsNullOrEmpty(serverUrl) || !Uri.TryCreate(serverUrl, UriKind.Absolute, out var uri))
            {
                throw new ArgumentException(nameof(serverUrl));
            }

            _serverUri = uri;
        }

        public HttpClient GetAuthenticatedHttpClient()
        {
            // Initialize HTTP client
            if (_httpClient == null)
            {
                var handler = new HubBearerTokenHttpClientHandler(_basicToken);

                _configureHandler?.Invoke(handler);

                _httpClient = new HttpClient(handler)
                {
                    BaseAddress = _serverUri
                };

                _httpClient.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue(Constants.HttpContentTypes.ApplicationJson));
            }

            return _httpClient;
        }
    }
}