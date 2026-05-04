import { useEffect, useState, useRef } from "react"
import { useLocation as useRouterLocation, useNavigate } from "react-router-dom"
import { MapPin, X, Search, Navigation, ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@food/components/ui/card"
import { Button } from "@food/components/ui/button"
import { Input } from "@food/components/ui/input"
import { useLocation } from "@food/hooks/useLocation"
import { toast } from "sonner"

export default function LocationPrompt() {
  const routerLocation = useRouterLocation()
  const navigate = useNavigate()
  const { location, loading, permissionGranted, requestLocation } = useLocation()
  
  // Hide location prompt on legal pages (Privacy, Terms, etc.)
  const isLegalPage = 
    routerLocation.pathname.includes("/privacy") || 
    routerLocation.pathname.includes("/terms") ||
    routerLocation.pathname.includes("/refund") ||
    routerLocation.pathname.includes("/shipping") ||
    routerLocation.pathname.includes("/cancellation")

  const [showPrompt, setShowPrompt] = useState(false)
  const [view, setView] = useState("prompt") // "prompt" | "manual"
  const [searchValue, setSearchValue] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    // Check if location permission was already granted
    const storedLocation = localStorage.getItem("userLocation")
    const promptDismissed = localStorage.getItem("locationPromptDismissed")

    if (!storedLocation && !promptDismissed && !isLegalPage) {
      const timer = setTimeout(() => {
        const currentLocation = localStorage.getItem("userLocation")
        if (!currentLocation && !permissionGranted) {
          setShowPrompt(true)
          document.body.style.overflow = "hidden"
        }
      }, 2000)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ""
      }
    }
  }, [permissionGranted, isLegalPage])

  // Search logic for manual entry
  useEffect(() => {
    if (view !== "manual" || searchValue.length < 3) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true)
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(searchValue)}`
        const res = await fetch(url, { headers: { Accept: "application/json" } })
        const json = await res.json()
        setSuggestions((json || []).map(r => ({
          id: r.place_id,
          display: r.display_name,
          lat: Number(r.lat),
          lng: Number(r.lon),
          address: r.address || {}
        })))
      } catch (e) {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue, view])

  const handleAllow = async () => {
    await requestLocation()
    setTimeout(() => {
      setShowPrompt(false)
      document.body.style.overflow = ""
      localStorage.setItem("locationPromptDismissed", "true")
    }, 500)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    document.body.style.overflow = ""
    localStorage.setItem("locationPromptDismissed", "true")
  }

  const handleManualEntry = () => {
    setView("manual")
  }

  const handleBackToPrompt = () => {
    setView("prompt")
    setSearchValue("")
    setSuggestions([])
    setSelectedLocation(null)
  }

  const handleDetectLocation = async () => {
    try {
      const loc = await requestLocation(true, true)
      if (loc?.latitude) {
        toast.success("Location detected!")
        setShowPrompt(false)
        document.body.style.overflow = ""
        localStorage.setItem("locationPromptDismissed", "true")
        // No need to navigate, useLocation hook already updates state
      }
    } catch (e) {
      toast.error("Failed to detect location")
    }
  }

  const handleSaveManualLocation = () => {
    if (!selectedLocation) {
      toast.error("Please select a location from the suggestions")
      return
    }

    const locData = {
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      address: selectedLocation.display,
      formattedAddress: selectedLocation.display,
      city: selectedLocation.address.city || selectedLocation.address.town || selectedLocation.address.village || "",
      area: selectedLocation.address.suburb || selectedLocation.address.neighbourhood || ""
    }

    localStorage.setItem("userLocation", JSON.stringify(locData))
    localStorage.setItem("locationPromptDismissed", "true")
    setShowPrompt(false)
    document.body.style.overflow = ""
    window.location.reload() // Reload to apply new location globally
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  if (isLegalPage || !showPrompt) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md border-2 border-gray-200 shadow-2xl mx-auto my-auto overflow-hidden transition-all duration-300"
      >
        {view === "prompt" ? (
          <>
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#7e3866]" />
                </div>
                <div>
                  <CardTitle>Enable Location Services</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get faster delivery and better recommendations
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We use your location to show nearby restaurants and provide accurate
                delivery times. Your location data is stored locally and never
                shared.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    className="flex-1"
                  >
                    Not Now
                  </Button>
                  <Button
                    onClick={handleAllow}
                    className="flex-1 bg-[#7e3866] hover:opacity-90 text-white"
                    disabled={loading}
                  >
                    {loading ? "Getting location..." : "Allow Location"}
                  </Button>
                </div>
                <Button
                  onClick={handleManualEntry}
                  variant="ghost"
                  className="w-full text-[#7e3866] hover:bg-[#7e3866]/10 font-semibold"
                >
                  Fill location manually
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex flex-col bg-white dark:bg-[#1a1a1a]">
            {/* Header with Icon */}
            <div className="p-6 text-center border-b dark:border-gray-800">
               <div className="h-16 w-16 rounded-full bg-[#7e386610] flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-[#7e3866]" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Location Access Required</h2>
               <p className="text-sm text-gray-500 dark:text-gray-400">
                  We need your location to show you products available near you and enable delivery services. Location access is required to continue.
               </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Search Section */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                   Search and select your location
                </label>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <Input 
                      placeholder="Type your address or location..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-[#7e3866]"
                   />
                   {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                         <Loader2 className="h-4 w-4 text-[#7e3866] animate-spin" />
                      </div>
                   )}
                </div>

                {/* Suggestions List */}
                {suggestions.length > 0 && (
                   <div className="mt-2 border rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 max-h-48 overflow-y-auto">
                      {suggestions.map(s => (
                         <button
                            key={s.id}
                            onClick={() => {
                               setSelectedLocation(s)
                               setSearchValue(s.display)
                               setSuggestions([])
                            }}
                            className="w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-none truncate"
                         >
                            {s.display}
                         </button>
                      ))}
                   </div>
                )}
              </div>

              {/* Separator */}
              <div className="flex items-center gap-4 py-2">
                 <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800" />
                 <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
                 <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800" />
              </div>

              {/* Detect My Location */}
              <Button
                 onClick={handleDetectLocation}
                 variant="outline"
                 className="w-full h-12 rounded-xl flex items-center justify-center gap-2 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200"
              >
                 <Navigation className="h-4 w-4" />
                 Detect My Location
              </Button>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-4">
                 <Button
                    onClick={handleBackToPrompt}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl bg-gray-100 border-none hover:bg-gray-200"
                 >
                    Back
                 </Button>
                 <Button
                    onClick={handleSaveManualLocation}
                    className="flex-1 h-12 rounded-xl bg-[#7e3866] hover:bg-[#55254b] text-white font-bold"
                    disabled={!selectedLocation}
                 >
                    Save Location
                 </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

